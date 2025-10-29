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
import {formatJalaliDate, toPersianDigits} from '../../utils/jalali-utils';

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

  displayValue = computed(() => {
    const date = this.selectedDate();
    if (!date) return '';
    const jalali = formatJalaliDate(date);
    return toPersianDigits(jalali);
  });

  onChange: (value: Date | null) => void = () => {
  };
  onTouched: () => void = () => {
  };

  togglePopup() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) this.onTouched();
  }

  onDateSelect(date: Date) {
    this.selectedDate.set(date);
    this.isOpen.set(false);
    this.onChange(date);
    this.dateChange.emit(date);
    this.onTouched();
  }

  writeValue(value: Date | null): void {
    this.selectedDate.set(value);
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

