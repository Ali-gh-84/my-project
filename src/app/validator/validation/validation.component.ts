import {Component, Input} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-validation',
  imports: [
    CommonModule
  ],
  standalone: true,
  templateUrl: './validation.component.html',
  styleUrl: './validation.component.css'
})
export class ValidationComponent {

  @Input() control!: AbstractControl | null;

  get showErrors(): boolean {
    return !!(
      this.control &&
      this.control.invalid &&
      (this.control.dirty || this.control.touched)
    );
  }
}
