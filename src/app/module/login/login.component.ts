import {Component} from '@angular/core';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzButtonComponent, NzButtonSize} from 'ng-zorro-antd/button';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {Router, RouterLink, Routes} from '@angular/router';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {isValidNationalCode} from '../../share/helpers/help';

@Component({
  selector: 'app-login',
  imports: [
    NzColDirective,
    NzRowDirective,
    ReactiveFormsModule,
    NzFormControlComponent,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzButtonComponent,
    NzWaveDirective,
    RouterLink,
    NzInputDirective
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  formSerialCode!: FormGroup;
  formNationalCode!: FormGroup;
  size: NzButtonSize = 'large';

  constructor(private fb: FormBuilder, private router: Router) {
    this.createForms();
  }

  createForms() {
    this.formSerialCode = this.fb.group({
      serial: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
    });

    this.formNationalCode = this.fb.group({
      nationalCode: ['', [Validators.required, isValidNationalCode]],
      serialNationalCode: ['', [Validators.required, Validators.pattern(/^\d{4,10}$/)]]
    });
  }

  loginWithSerialCode() {
    if (this.formSerialCode.valid) {
      console.log('Login with serial:', this.formSerialCode.value);
      this.router.navigate(['info']);
    }
  }

  loginWithNationalCode() {
    if (this.formNationalCode.valid) {
      console.log('Login with national:', this.formNationalCode.value);
      this.router.navigate(['info']);
    }
  }
}
