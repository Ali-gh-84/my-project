import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ElementRef,
  HostListener,
  inject
} from '@angular/core';
import {FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {JalaliCalendarComponent} from '../jalali-calendar/jalali-calendar.component';
import {formatJalaliDate, gregorianToJalali, jalaliToGregorian, toPersianDigits} from '../../utils/jalali-utils';

@Component({
  selector: 'app-jalali-date-picker',
  imports: [
    CommonModule, NzIconModule, JalaliCalendarComponent, FormsModule
  ],
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: JalaliDatePickerComponent,
    multi: true
  }],
  templateUrl: './jalali-date-picker.component.html',
  styleUrl: './jalali-date-picker.component.css'
})
export class JalaliDatePickerComponent {

  private elementRef = inject(ElementRef);

  @Input() placeholder = 'انتخاب تاریخ';
  @Output() dateChange = new EventEmitter<Date>();

  isOpen = signal(false);
  selectedDate = signal<Date | null>(null);

  // displayValue = computed(() => {
  //   const date = this.selectedDate();
  //   if (!date) return '';
  //   const jalali = formatJalaliDate(date);
  //   return toPersianDigits(jalali);
  // });

  displayValue = computed(() => {
    const date = this.selectedDate();
    if (!date) return '';
    const [y, m, d] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return toPersianDigits(`${y}/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}`);
  });

  // onChange: (value: Date | null) => void = () => {
  // };
  onChange: (value: string | null) => void = () => {};

  onTouched: () => void = () => {
  };

  togglePopup() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) this.onTouched();
  }

  onDateSelect(date: Date) {
    this.selectedDate.set(date);

    const [y, m, d] = gregorianToJalali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    const jalaliString = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;

    this.isOpen.set(false);
    this.onChange(jalaliString);  // خروجی فرم: string
    this.dateChange.emit(date);
    this.onTouched();
  }

  // onDateSelect(date: Date) {
  //   this.selectedDate.set(date);
  //   this.isOpen.set(false);
  //   this.onChange(date);
  //   this.dateChange.emit(date);
  //   this.onTouched();
  // }

  // writeValue(value: Date | null): void {
  //   this.selectedDate.set(value);
  // }

  // JalaliDatePickerComponent
  writeValue(value: any): void {
    if (!value) {
      this.selectedDate.set(null);
      return;
    }

    if (typeof value === 'string' && value.length === 8) {
      const y = +value.substring(0, 4);
      const m = +value.substring(4, 6);
      const d = +value.substring(6, 8);
      const date = jalaliToGregorian(y, m, d);
      this.selectedDate.set(date);
    } else if (value instanceof Date) {
      this.selectedDate.set(value);
    } else {
      this.selectedDate.set(null);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  private formatJalali(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${day}/${month}/${year}`;
  }
}

