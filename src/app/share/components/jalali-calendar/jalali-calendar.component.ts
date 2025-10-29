import {Component, EventEmitter, Output, Input, signal, computed, effect} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  setMonth,
  setYear,
} from 'date-fns-jalali';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {gregorianToJalali, toPersianDigits} from '../../utils/jalali-utils';

@Component({
  selector: 'app-jalali-calendar',
  imports: [
    CommonModule, FormsModule, NzIconModule
  ],
  standalone: true,
  templateUrl: './jalali-calendar.component.html',
  styleUrl: './jalali-calendar.component.css'
})
export class JalaliCalendarComponent {

  currentDate = signal(new Date());
  selectedDate = signal<Date | null>(null);

  @Input() set date(value: Date | null) {
    if (value) this.selectedDate.set(value);
  }

  @Output() dateChange = new EventEmitter<Date>();

  days = computed(() => {
    const start = startOfMonth(this.currentDate());
    const end = endOfMonth(this.currentDate());
    return eachDayOfInterval({start, end});
  });

  monthName = computed(() => {
    const date = this.currentDate();
    const [, month] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return this.persianMonths[month - 1];
  });

  year = computed(() => {
    const date = this.currentDate();
    const [year] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return year;
  });

  persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  years = Array.from({length: 46}, (_, i) => 1360 + i);

  weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  iranHolidays = ['1404-01-01', '1404-01-02', '1404-01-03', '1404-01-04', '1404-01-13'];

  onYearChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const year = parseInt(select.value, 10);
    this.currentDate.update(d => setYear(d, year));
  }

  onMonthChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const month = parseInt(select.value, 10);
    this.currentDate.update(d => setMonth(d, month));
  }

  prevMonth() {
    this.currentDate.update(d => subMonths(d, 1));
  }

  nextMonth() {
    this.currentDate.update(d => addMonths(d, 1));
  }

  selectDay(day: Date) {
    this.selectedDate.set(day);
    this.dateChange.emit(day);
  }

  dayClass(day: Date): string {
    const dateStr = this.formatJalali(day, 'yyyy-MM-dd');
    const isSelected = this.selectedDate() && isSameDay(day, this.selectedDate()!);
    const isHoliday = this.iranHolidays.includes(dateStr);
    const isToday = isSameDay(day, new Date());

    return `
    ${isSelected ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-100'}
    ${isHoliday ? 'text-red-600' : ''}
    ${isToday && !isSelected ? 'ring-2 ring-green-500 ring-inset' : ''}
  `.trim();
  }

  getStartDayOffset(): number {
    const start = startOfMonth(this.currentDate());
    return start.getDay();
  }

  private formatJalali(date: Date, formatStr: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  calendarGrid = computed(() => {
    const start = startOfMonth(this.currentDate());
    const end = endOfMonth(this.currentDate());
    const days = eachDayOfInterval({start, end});

    const firstDayOfWeek = start.getDay();
    const totalCells = 42;
    const grid: (Date | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      grid.push(null);
    }

    days.forEach(day => grid.push(day));

    while (grid.length < totalCells) {
      grid.push(null);
    }

    return grid;
  });

  isSelected(cell: Date | null): boolean {
    return !!cell && !!this.selectedDate() && isSameDay(cell, this.selectedDate()!);
  }

  isToday(cell: Date | null): boolean {
    return !!cell && isSameDay(cell, new Date());
  }

  isHoliday(cell: Date | null): boolean {
    if (!cell) return false;
    const dateStr = `${cell.getFullYear()}-${String(cell.getMonth() + 1).padStart(2, '0')}-${String(cell.getDate()).padStart(2, '0')}`;
    return this.iranHolidays.includes(dateStr);
  }

  formatJalaliDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  toJalaliDay(date: Date): number {
    const [, , day] = gregorianToJalali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    return day;
  }

  persianYear(year: number): string {
    return toPersianDigits(year);
  }

  toJalaliDayPersian(date: Date): string {
    const [, , day] = gregorianToJalali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    return toPersianDigits(day);
  }

  toPersianDigits(str: string | number): string {
    return toPersianDigits(str);
  }
}
