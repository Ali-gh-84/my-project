import {Component} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {isValidNationalCode, isValidPhoneNumber} from '../../share/helpers/help';

@Component({
  selector: 'app-forget-serial',
  imports: [
    FormsModule,
    NzButtonComponent,
    NzColDirective,
    NzFormControlComponent,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzInputDirective,
    NzRowDirective,
    NzWaveDirective,
    ReactiveFormsModule
  ],
  templateUrl: './forget-serial.component.html',
  styleUrl: './forget-serial.component.css'
})
export class ForgetSerialComponent {

  formForgetSerialCode!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.createForms();
  }

  createForms() {
    this.formForgetSerialCode = this.fb.group({
      nationalCode: ['', [Validators.required, isValidNationalCode]],
      numberPhone: ['', [Validators.required, isValidPhoneNumber]]
    });
  }

  returnData() {
    if (this.formForgetSerialCode.valid) {
      console.log('data sent:', this.formForgetSerialCode.value);
      this.router.navigate(['personal-info']);
    }
  }
}
