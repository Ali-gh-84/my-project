// src/app/share/components/jalali-date-picker/jalali-date-picker.component.ts
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { JalaliCalendarComponent } from '../jalali-calendar/jalali-calendar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jalali-date-picker',
  standalone: true,
  imports: [CommonModule, NzInputModule, NzIconModule, JalaliCalendarComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JalaliDatePickerComponent),
      multi: true
    }
  ],
  template: `
    <nz-input-group [nzSuffix]="calendarIcon" class="jalali-picker">
      <input
        nz-input
        [placeholder]="placeholder"
        [value]="displayValue"
        (click)="toggleCalendar()"
        readonly
      />
    </nz-input-group>

    <ng-template #calendarIcon>
      <span nz-icon nzType="calendar" nzTheme="outline" class="icon"></span>
    </ng-template>

    <div class="calendar-dropdown" [class.open]="isOpen">
      <app-jalali-calendar
        [date]="selectedDate"
        (dateChange)="onDateSelect($event)"
      ></app-jalali-calendar>
    </div>
  `,
  styles: [`
    .jalali-picker { position: relative; display: inline-block; width: 100%; }
    .icon { cursor: pointer; color: #1890ff; }
    .calendar-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      margin-top: 4px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
      z-index: 1050;
      max-height: 0;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    .calendar-dropdown.open {
      max-height: 400px;
      padding: 8px;
    }
  `]
})
export class JalaliDatePickerComponent implements ControlValueAccessor {
  @Input() placeholder: string = 'تاریخ را انتخاب کنید';
  @Output() dateChange = new EventEmitter<Date>();

  isOpen = false;
  selectedDate: Date | null = null;
  displayValue = '';

  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  toggleCalendar() {
    this.isOpen = !this.isOpen;
    this.onTouched();
  }

  onDateSelect(date: Date) {
    this.selectedDate = date;
    this.displayValue = this.formatJalali(date);
    this.onChange(date);
    this.dateChange.emit(date);
    this.isOpen = false;
  }

  writeValue(value: Date | null): void {
    this.selectedDate = value;
    this.displayValue = value ? this.formatJalali(value) : '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private formatJalali(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  }
}
