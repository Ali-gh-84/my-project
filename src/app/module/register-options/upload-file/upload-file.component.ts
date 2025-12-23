import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit, Input, ViewChild
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
import {ActivatedRoute, Router} from '@angular/router';
import {FileUploaderComponent} from '../../../share/components/file-uploader/file-uploader.component';

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
    FileUploaderComponent,
    ImageCropperComponent
  ],
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent implements OnInit, AfterViewInit {

  @Output() nextStep3 = new EventEmitter<void>();
  @Input() uploadFileForm!: FormGroup;

  @ViewChild('personalPictureInput') personalPictureInput!: ElementRef<HTMLInputElement>;

  loading: { [key: string]: boolean } = {};
  previews: { [key: string]: string | null } = {};
  cropperEvent: Event | null = null;
  croppedBlob: Blob | null = null;
  showCropperModal = false;

  tenantId!: number;
  id!: number;
  tenantSection!: number;
  theme: any = {};

  fileFields: FileField[] = [
    {
      label: 'تصویر شخصی',
      labelName: 'personalPicture',
      controlName: 'personalPicture',
      buttonText: 'آپلود مدرک',
      required: true
    },
    {
      label: 'کارت ملی',
      labelName: 'nationalCard',
      controlName: 'nationalCard',
      buttonText: 'آپلود مدرک',
      required: true
    },
    {
      label: 'صفحه اول شناسنامه',
      labelName: 'firstPageNationalCard',
      controlName: 'firstPageNationalCard',
      buttonText: 'آپلود مدرک',
      required: true
    },
    {
      label: 'صفحه دوم شناسنامه',
      labelName: 'secondPageNationalCard',
      controlName: 'secondPageNationalCard',
      buttonText: 'آپلود مدرک',
      required: true
    },
    {
      label: 'صفحه سوم شناسنامه',
      labelName: 'thirdPageNationalCard',
      controlName: 'thirdPageNationalCard',
      buttonText: 'آپلود مدرک',
      required: true
    },
    {label: 'مدرک دیپلم', labelName: 'diploma', controlName: 'diploma', buttonText: 'آپلود مدرک', required: true}
  ];

  constructor(
    private fb: FormBuilder,
    private printDataService: PrintDataService,
    private enterInformationService: EnterInformationService,
    private uploadFileService: UploadFileService,
    private minioService: MinioService,
    private mainPageService: MainPageService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.id = this.enterInformationService.getUserId();

    this.mainPageService.currentTenant$.subscribe(tenantData => {
      if (tenantData) {
        this.tenantId = tenantData.tenantId;
        this.tenantSection = tenantData.section;
        this.theme = tenantData.theme;
      }
    });

    const stored = this.mainPageService.getCurrentTenantFromStorage();
    if (stored) {
      this.tenantId = stored.tenantId;
      this.tenantSection = stored.section;
      this.theme = stored.theme;
      this.mainPageService.setCurrentTenant(stored.tenantId, stored.section);
    } else {
      this.router.navigate(['/']);
    }

    const formConfig: any = {};
    this.fileFields.forEach(f => {
      formConfig[f.controlName] = f.required ? [null, Validators.required] : [null];
      this.loading[f.controlName] = false;
      this.previews[f.controlName] = null;
    });
    this.uploadFileForm = this.fb.group(formConfig);
  }

  ngAfterViewInit(): void {
  }

  triggerPersonalPictureInput(): void {
    this.personalPictureInput.nativeElement.click();
  }

  onPersonalPictureSelected(event: Event): void {
    this.cropperEvent = event;
    this.showCropperModal = true;
  }

  onImageCropped(event: ImageCroppedEvent): void {
    if (event.blob) {
      this.croppedBlob = event.blob;
      this.previews['personalPicture'] = URL.createObjectURL(event.blob);
    }
  }

  cropperReady(): void {
    console.log('Cropper آماده است');
  }

  loadImageFailed(): void {
    this.createMessage('error', 'فایل معتبر نیست.');
  }

  saveCroppedImage(): void {
    if (!this.croppedBlob) return;

    const file = new File([this.croppedBlob], 'personal-picture-cropped.png', {type: 'image/png'});
    this.loading['personalPicture'] = true;

    this.minioService.upload([file], `register/register_${this.id}`, this.tenantId, 'personalPicture')
      .subscribe({
        next: (res: any) => {
          const uploaded = res?.result?.[0];
          if (uploaded?.url) {
            const value = {name: 'تصویر شخصی', url: uploaded.url};
            this.uploadFileForm.get('personalPicture')?.setValue(value);
            this.previews['personalPicture'] = uploaded.url;
          }
        },
        error: (err) => this.createMessage('error', err.error?.message || 'خطا در آپلود'),
        complete: () => {
          this.loading['personalPicture'] = false;
          this.closeCropperModal();
        }
      });
  }

  cancelCrop(): void {
    this.closeCropperModal();
    if (this.personalPictureInput) this.personalPictureInput.nativeElement.value = '';
  }

  closeCropperModal(): void {
    this.showCropperModal = false;
    this.cropperEvent = null;
    this.croppedBlob = null;
  }

  onFileUpload(controlName: string, fileList: FileList) {
    if (!fileList?.length) return;
    const file = fileList[0];
    this.uploadFile(file, controlName);
  }

  onFileRemove(controlName: string) {
    const currentValue = this.uploadFileForm.get(controlName)?.value;
    if (currentValue?.url) {
      this.minioService.deleteFiles([currentValue.url]).subscribe({
        next: () => this.clearFile(controlName),
        error: () => this.createMessage('error', 'خطا در حذف فایل')
      });
    } else {
      this.clearFile(controlName);
    }

    if (controlName === 'personalPicture' && this.personalPictureInput) {
      this.personalPictureInput.nativeElement.value = '';
    }
  }

  private uploadFile(file: File, controlName: string) {
    this.loading[controlName] = true;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => (this.previews[controlName] = reader.result as string);
      reader.readAsDataURL(file);
    }

    const labelName = this.fileFields.find(f => f.controlName === controlName)?.labelName || controlName;

    this.minioService.upload([file], `register/register_${this.id}`, this.tenantId, labelName)
      .subscribe({
        next: (res: any) => {
          const uploaded = res?.result?.[0];
          if (uploaded?.url) {
            const label = this.fileFields.find(f => f.controlName === controlName)?.label || controlName;
            const value = {name: label, url: uploaded.url};
            this.uploadFileForm.get(controlName)?.setValue(value);
            this.previews[controlName] = uploaded.url; // Use real URL if possible
          }
        },
        error: (err) => {
          this.createMessage('error', err.error?.message || 'خطا در آپلود فایل');

          // CRITICAL: Clean up on failure
          this.previews[controlName] = null;
          this.uploadFileForm.get(controlName)?.setValue(null);
        },
        complete: () => {
          this.loading[controlName] = false;
        }
      });
  }

  private clearFile(controlName: string) {
    this.uploadFileForm.get(controlName)?.setValue(null);
    this.previews[controlName] = null;
    this.loading[controlName] = false;
  }

  onSubmit(): void {
    this.uploadFileForm.markAllAsTouched();
    if (!this.uploadFileForm.valid) {
      console.warn('فرم نامعتبر است');
      return;
    }

    const previousData = this.enterInformationService.getAllInfo();
    const files = Object.keys(this.uploadFileForm.value)
      .filter(key => this.uploadFileForm.get(key)?.value?.url)
      .map(key => ({
        name: this.uploadFileForm.get(key)?.value.name,
        url: this.uploadFileForm.get(key)?.value.url,
        uploadDate: new Date().toISOString()
      }));

    const body = {...previousData, files};

    this.uploadFileService.updateDocuments(body).subscribe({
      next: (res) => {
        console.log(res);
        this.nextStep3.emit();
      },
      error: (err) => this.createMessage('error', err.error.message)
    });
  }

  createMessage(type: string, content: string): void {
    this.message.create(type, content);
  }
}
