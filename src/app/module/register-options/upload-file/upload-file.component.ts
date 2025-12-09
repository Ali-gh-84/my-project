import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit, Input
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {ImageCropperComponent, ImageCroppedEvent} from 'ngx-image-cropper';
import {PrintDataService} from '../print-data/print-data.service';
import {EnterInformationService} from '../enter-information/enter-information.service';
import {UploadFileService} from './upload-file.service';
import {MinioService} from '../../../core/services/minio.service';
import {MainPageService} from '../../mainpagecomponent/main-page.service';
import {NzMessageService} from 'ng-zorro-antd/message';

interface FileField {
  label: string;
  labelName: string;
  controlName: string;
  buttonText: string;
  required: boolean;
}

@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    ReactiveFormsModule,
    ImageCropperComponent
  ],
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent implements OnInit, AfterViewInit {
  @Output() nextStep3 = new EventEmitter<void>();

  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef<HTMLInputElement>>;

  @Input() uploadFileForm!: FormGroup;
  loading: { [key: string]: boolean } = {};
  previews: { [key: string]: string | null } = {};
  cropperEvents: { [key: string]: Event | null } = {};
  croppedBlobs: { [key: string]: Blob | null } = {};

  showCropperModal = false;
  tenantId!: number;
  periodId!: number;
  id!: number;
  tenantSection!: number;
  theme: any = {};

  fileFields: FileField[] = [
    {
      label: 'تصویر شخصی',
      labelName: 'personalPicture',
      controlName: 'personalPicture',
      buttonText: 'آپلود تصویر شخصی',
      required: true
    },
    {
      label: 'کارت ملی',
      labelName: 'nationalCard',
      controlName: 'nationalCard',
      buttonText: 'آپلود کارت ملی',
      required: true
    },
    {
      label: 'صفحه اول شناسنامه',
      labelName: 'firstPageNationalCard',
      controlName: 'firstPageNationalCard',
      buttonText: 'آپلود صفحه اول',
      required: true
    },
    {
      label: 'صفحه دوم شناسنامه',
      labelName: 'secondPageNationalCard',
      controlName: 'secondPageNationalCard',
      buttonText: 'آپلود صفحه دوم',
      required: true
    },
    {
      label: 'صفحه سوم شناسنامه',
      labelName: 'thirdPageNationalCard',
      controlName: 'thirdPageNationalCard',
      buttonText: 'آپلود صفحه سوم',
      required: true
    },
    {
      label: 'مدرک دیپلم',
      labelName: 'diploma',
      controlName: 'diploma',
      buttonText: 'آپلود مدرک دیپلم',
      required: true
    }
  ];

  private fileInputElements: ElementRef<HTMLInputElement>[] = [];

  constructor(
    private fb: FormBuilder,
    private printDataService: PrintDataService,
    private enterInformationService: EnterInformationService,
    private uploadFileService: UploadFileService,
    private minioService: MinioService,
    private mainPageService: MainPageService,
    private message: NzMessageService,
  ) {
  }

  uploadedFiles: { [key: string]: { name: string; url: string; uploadedAt?: string } | null } = {};

  ngOnInit(): void {

    const periodInfo = this.mainPageService.periodInformations.value;

    if (periodInfo) {
      console.log('yes')
      this.tenantId = periodInfo.tenantId;
      this.periodId = periodInfo.periodId;
      this.tenantSection = periodInfo.section;
    } else {
    }

    this.id = this.enterInformationService.getUserId();

    this.mainPageService.getTenantList().subscribe(cards => {
      const currentTenant = cards.find(c => +c.id === this.tenantId || c.section === this.tenantId);
      if (currentTenant) {
        this.tenantSection = currentTenant.section;
        this.theme = this.mainPageService.getTenantTheme(this.tenantSection);
      }
    });

    const formConfig: any = {};
    this.fileFields.forEach(f => {
      formConfig[f.controlName] = f.required ? [null, Validators.required] : [null];
      this.loading[f.controlName] = false;
      this.previews[f.controlName] = null;
      this.cropperEvents[f.controlName] = null;
      this.croppedBlobs[f.controlName] = null;
      this.uploadedFiles[f.controlName] = null;
    });
    this.uploadFileForm = this.fb.group(formConfig);
  }

  ngAfterViewInit(): void {
    this.fileInputElements = this.fileInputs.toArray();
  }

  triggerFileInput(index: number): void {
    const input = this.fileInputElements[index];
    if (input) input.nativeElement.click();
  }

  onFileSelected(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (controlName === 'personalPicture') {
      this.cropperEvents[controlName] = event;
      this.showCropperModal = true;
      return;
    }

    this.processFile(file, controlName);
    input.value = '';
  }

  getFieldLabel(controlName: string): string {
    const field = this.fileFields.find(f => f.controlName === controlName);
    return field?.label ?? controlName;
  }

  getFieldLabelName(controlName: string): string {
    const field = this.fileFields.find(f => f.controlName === controlName);
    return field?.labelName ?? controlName;
  }


  processFile(file: File, controlName: string): void {
    this.loading[controlName] = true;

    const reader = new FileReader();
    reader.onload = () => {
      this.previews[controlName] = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.minioService.upload([file], `register/register_${this.id}`, this.tenantId, this.getFieldLabelName(controlName))
      .subscribe({
        next: (res: any) => {
          const uploaded = res?.result?.[0];
          if (uploaded?.url) {
            this.uploadedFiles[controlName] = {
              name: this.getFieldLabel(controlName),
              url: uploaded.url,
              uploadedAt: new Date().toISOString()
            };

            this.uploadFileForm.get(controlName)?.setValue({
              name: this.getFieldLabel(controlName),
              url: uploaded.url,
              uploadedAt: new Date().toISOString()
            });
          }
        },
        error: (err) => {
          console.error(err.error.message);
        },
        complete: () => {
          this.loading[controlName] = false;
        }
      });
  }

  onImageCropped(event: ImageCroppedEvent, controlName: string): void {
    if (event.blob) {
      this.croppedBlobs[controlName] = event.blob;
      this.previews[controlName] = URL.createObjectURL(event.blob);
    }
  }

  cropperReady(): void {
    console.log('Cropper آماده است');
  }

  loadImageFailed(): void {
    alert('خطا: فایل انتخاب‌شده تصویر معتبر نیست.');
  }

  saveCroppedImage(controlName: string): void {
    const blob = this.croppedBlobs[controlName];
    if (!blob) return;

    const file = new File([blob], 'personal-picture-cropped.png', {type: 'image/png'});

    this.loading[controlName] = true;

    this.previews[controlName] = URL.createObjectURL(file);

    this.minioService.upload([file], `register/register_${this.id}`, this.tenantId, this.getFieldLabelName(controlName))
      .subscribe({
        next: (res: any) => {
          const uploaded = res?.result?.[0];
          if (uploaded?.url) {

            this.uploadedFiles[controlName] = {
              name: this.getFieldLabel(controlName),
              url: uploaded.url,
              uploadedAt: new Date().toISOString()
            };

            this.uploadFileForm.get(controlName)?.setValue({
              name: this.getFieldLabel(controlName),
              url: uploaded.url,
              uploadedAt: new Date().toISOString()
            });

            this.uploadFileForm.get(controlName)?.markAsDirty();
            this.uploadFileForm.get(controlName)?.markAsTouched();
          }
        },

        error: (err) => {
          console.error(err.error.message);
        },
        complete: () => {
          this.loading[controlName] = false;
        }
      });

    this.closeCropperModal(controlName);
  }

  cancelCrop(controlName: string): void {
    this.closeCropperModal(controlName);
  }

  closeCropperModal(controlName: string): void {
    this.showCropperModal = false;
    this.cropperEvents[controlName] = null;
    this.croppedBlobs[controlName] = null;
  }

  createMessage(type: string, content: string): void {
    this.message.create(type, content);
  }

  removeFile(controlName: string): void {
    const fileData = this.uploadedFiles[controlName];

    if (fileData?.url) {
      this.minioService.deleteFiles([fileData.url]).subscribe({
        next: () => {
          this.clearFileState(controlName);
        },
        error: (err: any) => {
          this.createMessage('error', err.error.message);
          console.error(err.error.message);
        }
      });
    } else {
      this.clearFileState(controlName);
    }
  }

  clearFileState(controlName: string): void {
    this.uploadFileForm.get(controlName)?.setValue(null);
    this.previews[controlName] = null;
    this.loading[controlName] = false;
    this.cropperEvents[controlName] = null;
    this.croppedBlobs[controlName] = null;
    this.uploadedFiles[controlName] = null;

    const index = this.fileFields.findIndex(f => f.controlName === controlName);
    const input = this.fileInputElements[index];
    if (input) input.nativeElement.value = '';
  }

  onSubmit(): void {
    this.uploadFileForm.markAllAsTouched();
    if (!this.uploadFileForm.valid) {
      console.warn('فرم نامعتبر است');
      return;
    }

    const previousData = this.enterInformationService.getAllInfo();


    const files = Object.values(this.uploadedFiles)
      .filter((f): f is { name: string; url: string; uploadedAt?: string } => !!f)
      .map(f => ({
        name: f.name,
        url: f.url,
        uploadDate: f.uploadedAt ?? new Date().toISOString()
      }));

    const body = {
      ...previousData,
      files
    };

    this.uploadFileService.updateDocuments(body).subscribe({
      next: (res) => {
        console.log(res);
        this.nextStep3.emit();
      },
      error: (err) => {
        this.createMessage('error', err.error.message);
        console.error(err.error.message);
      }
    });
  }

  nextStep(): void {
  }
}
