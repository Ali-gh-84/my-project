import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {DynamicFormComponent, FieldConfig} from '../../share/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-user-verification-panel',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzGridModule,
    NzButtonModule,
    DynamicFormComponent
  ],
  templateUrl: './user-verification-panel.component.html',
  styleUrl: './user-verification-panel.component.css'
})
export class UserVerificationPanelComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() loading = false;
  @Output() next = new EventEmitter<void>();

  fields: FieldConfig[] = [
    {
      controlName: 'nationalCode',
      label: 'کد ملی',
      type: 'text',
      required: true
    },
    {
      controlName: 'jalaliBirthDate',
      label: 'تاریخ تولد',
      type: 'date',
      required: true
    }
  ];

  onNext() {
    if (this.form.valid) {
      this.next.emit();
    }
  }
}
