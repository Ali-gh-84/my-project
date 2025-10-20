import {Component, EventEmitter, Output} from '@angular/core';
import {NzButtonModule, NzButtonSize} from 'ng-zorro-antd/button';
import {FormGroup, FormsModule, Validators} from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';


@Component({
  selector: 'app-register-serial',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzFormModule,
    NzModalModule,
    NzCheckboxModule
  ],
  templateUrl: './register-serial.component.html',
  styleUrl: './register-serial.component.css'
})
export class RegisterSerialComponent {

  @Output() nextStep1 = new EventEmitter<void>();
  serialForm!: FormGroup;
  size: NzButtonSize  = 'large';

  buttonInfo: any[] = [
    {
      title: 'سریال کارت خرید ثبت نام',
      icon: ''
    },
    {
      title: 'مرحله بعد',
      icon: ''
    },
  ]

  Data: any[] = [
    {
      title: 'نكات قابل توجه:',
      description: '1- هر داوطلب فقط يك مرتبه مي تواند ثبت نام نمايد.\n' +
        '2- در صورت نياز به تكميل يا ويرايش اطلاعات مي توانيد با همين سريال كارت ثبت نام، مجددا وارد سامانه شويد.\n' +
        '3- پس از وارد كردن كد رهگيري، گزينه مرحله بعد را انتخاب نماييد.'
    },
  ]

  constructor(private fb: FormBuilder,) {
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.serialForm = this.fb.group({
      serial: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    });
  }

  get form() {
    return this.serialForm;
  }

  resetForm() {
    this.serialForm.reset();
  }

  nextStep() {
    this.nextStep1.emit();
  }
}
