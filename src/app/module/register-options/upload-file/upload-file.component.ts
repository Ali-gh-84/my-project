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

interface FileField {
  label: string;
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

  fileFields: FileField[] = [
    {label: 'تصویر شخصی', controlName: 'personalPicture', buttonText: 'آپلود تصویر شخصی', required: true},
    {label: 'کارت ملی', controlName: 'nationalCard', buttonText: 'آپلود کارت ملی', required: true},
    {label: 'صفحه اول شناسنامه', controlName: 'firstPageNationalCard', buttonText: 'آپلود صفحه اول', required: true},
    {label: 'صفحه دوم شناسنامه', controlName: 'secondPageNationalCard', buttonText: 'آپلود صفحه دوم', required: true},
    {label: 'صفحه سوم شناسنامه', controlName: 'thirdPageNationalCard', buttonText: 'آپلود صفحه سوم', required: true},
    {label: 'مدرک دیپلم', controlName: 'diploma', buttonText: 'آپلود مدرک دیپلم', required: true}
  ];

  private fileInputElements: ElementRef<HTMLInputElement>[] = [];

  constructor(
    private fb: FormBuilder,
    private printDataService: PrintDataService) {
  }

  ngOnInit(): void {
    const formConfig: any = {};
    this.fileFields.forEach(f => {
      formConfig[f.controlName] = f.required ? [null, Validators.required] : [null];
      this.loading[f.controlName] = false;
      this.previews[f.controlName] = null;
      this.cropperEvents[f.controlName] = null;
      this.croppedBlobs[f.controlName] = null;
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

  private processFile(file: File, controlName: string): void {
    this.loading[controlName] = true;
    const reader = new FileReader();
    reader.onload = () => {
      this.previews[controlName] = reader.result as string;
      this.uploadFileForm.get(controlName)?.setValue(file);
      this.loading[controlName] = false;
    };
    reader.readAsDataURL(file);
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
    const control = this.uploadFileForm.get(controlName);
    if (control) {
      control.setValue(file);
      control.markAsDirty();
      control.markAsTouched();
    }

    this.closeCropperModal(controlName);
  }

  cancelCrop(controlName: string): void {
    this.closeCropperModal(controlName);
  }

  private closeCropperModal(controlName: string): void {
    this.showCropperModal = false;
    this.cropperEvents[controlName] = null;
    this.croppedBlobs[controlName] = null;
  }

  removeFile(controlName: string): void {
    const control = this.uploadFileForm.get(controlName);
    if (control) {
      control.setValue(null);
      control.markAsTouched();
      control.markAsDirty();
      control.updateValueAndValidity();
    }
    this.previews[controlName] = null;
    this.loading[controlName] = false;
    this.cropperEvents[controlName] = null;
    this.croppedBlobs[controlName] = null;

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

    const formData = new FormData();
    let personalPictureUrl: string | null = null;

    this.fileFields.forEach(field => {
      const file = this.uploadFileForm.get(field.controlName)?.value;
      if (file) {
        formData.append(field.controlName, file, file.name);

        if (field.controlName === 'personalPicture' && file) {
          if (this.previews[field.controlName]) {
            personalPictureUrl = this.previews[field.controlName];
          }
        }
      }
    });

    this.printDataService.updateUserPhoto(personalPictureUrl);

    this.nextStep3.emit();
  }

  nextStep(): void {
  }
}
