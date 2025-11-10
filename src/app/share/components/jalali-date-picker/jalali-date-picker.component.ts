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
import {gregorianToJalali, toPersianDigits} from '../../utils/jalali-utils';

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
  @Output() dateChange = new EventEmitter<string>();

  isOpen = signal(false);
  selectedJalaliString = signal<string>('');

  displayValue = computed(() => {
    const str = this.selectedJalaliString();
    if (!str || str.length !== 8) return '';
    const y = str.substring(0, 4);
    const m = str.substring(4, 6);
    const d = str.substring(6, 8);
    return toPersianDigits(`${y}/${m}/${d}`);
  });

  onChange: (value: string | null) => void = () => {
  };

  onTouched: () => void = () => {
  };

  togglePopup() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) this.onTouched();
  }

  onDateSelect(date: Date) {
    const [y, m, d] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const jalaliString = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;

    this.selectedJalaliString.set(jalaliString);
    this.isOpen.set(false);
    this.onChange(jalaliString);
    this.dateChange.emit(jalaliString);
    this.onTouched();
  }

  writeValue(value: any): void {
    if (typeof value === 'string' && value.length === 8 && /^\d{8}$/.test(value)) {
      this.selectedJalaliString.set(value);
    } else {
      this.selectedJalaliString.set('');
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

