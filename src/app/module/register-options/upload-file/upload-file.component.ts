import {Component, EventEmitter, Output} from '@angular/core';
import {NzGridModule} from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzUploadChangeParam, NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-upload-file',
  imports: [
    CommonModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzUploadModule,
    ReactiveFormsModule
  ],
  standalone: true,
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.css'
})
export class UploadFileComponent {

  @Output() nextStep3 = new EventEmitter<void>();
  uploadFileForm!: FormGroup;
  loading: { [key: string]: boolean } = {};

  fileFields = [
    { label: 'تصویر شخصی', controlName: 'personalPicture', buttonText: 'آپلود تصویر شخصی', required: true },
    { label: 'کارت ملی', controlName: 'nationalCard', buttonText: 'آپلود کارت ملی', required: true },
    { label: 'صفحه اول شناسنامه', controlName: 'firstPageNationalCard', buttonText: 'آپلود صفحه اول', required: true },
    { label: 'صفحه دوم شناسنامه', controlName: 'secondPageNationalCard', buttonText: 'آپلود صفحه دوم', required: true },
    { label: 'صفحه سوم شناسنامه', controlName: 'thirdPageNationalCard', buttonText: 'آپلود صفحه سوم', required: true },
    { label: 'مدرک دیپلم', controlName: 'diploma', buttonText: 'آپلود مدرک دیپلم', required: true }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const formGroupConfig: any = {};
    this.fileFields.forEach(f => {
      formGroupConfig[f.controlName] = f.required ? [null, Validators.required] : [null];
      this.loading[f.controlName] = false;
    });
    this.uploadFileForm = this.fb.group(formGroupConfig);
  }

  handleChange(info: NzUploadChangeParam, controlName: string): void {
    this.loading[controlName] = true;

    const file = info.file.originFileObj ?? null;
    this.uploadFileForm.get(controlName)?.setValue(file);

    setTimeout(() => {
      this.loading[controlName] = false;
    }, 2000);
  }

  nextStep() {
    this.nextStep3.emit();
  }

  onSubmit(): void {
    console.log(this.uploadFileForm.value);
  }
}
