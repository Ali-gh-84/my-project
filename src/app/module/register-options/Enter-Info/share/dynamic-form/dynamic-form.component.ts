import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import {JalaliDatePickerComponent} from '../../../../../share/components/jalali-date-picker/jalali-date-picker.component';

export interface FieldConfig {
  controlName: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: any }[] | (() => { label: string; value: any }[]);
  span?: number;
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    JalaliDatePickerComponent,
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css'
})
export class DynamicFormComponent {

  @Input({ required: true }) field!: FieldConfig;

  get control() {
    return this.parentForm.control.get(this.field.controlName)!;
  }

  get options() {
    if (!this.field.options) return [];
    return typeof this.field.options === 'function'
      ? this.field.options()
      : this.field.options;
  }

  constructor(private parentForm: FormGroupDirective) {}
}
