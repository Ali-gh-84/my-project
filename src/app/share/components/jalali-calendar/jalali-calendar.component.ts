import { Component, EventEmitter, Output, Input, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameDay,
  setMonth,
  setYear,
} from 'date-fns-jalali';
// import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NzIconModule } from 'ng-zorro-antd/icon';

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

  // faChevronLeft = faChevronLeft;
  // faChevronRight = faChevronRight;

  currentDate = signal(new Date());
  selectedDate = signal<Date | null>(null);

  @Input() set date(value: Date | null) {
    if (value) this.selectedDate.set(value);
  }
  @Output() dateChange = new EventEmitter<Date>();

  days = computed(() => {
    const start = startOfMonth(this.currentDate());
    const end = endOfMonth(this.currentDate());
    return eachDayOfInterval({ start, end });
  });

  monthName = computed(() => this.persianMonths[this.currentDate().getMonth()]);
  year = computed(() => this.currentDate().getFullYear());

  persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  // سال‌های ۱۳۶۰ تا ۱۴۰۵
  years = Array.from({ length: 46 }, (_, i) => 1360 + i);

  weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  iranHolidays = ['1404-01-01', '1404-01-02', '1404-01-03', '1404-01-04', '1404-01-13'];

  // تغییر سال
  onYearChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const year = parseInt(select.value, 10);
    this.currentDate.update(d => setYear(d, year));
  }

  // تغییر ماه
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

  // محاسبه فاصله تا اولین روز هفته
  getStartDayOffset(): number {
    const start = startOfMonth(this.currentDate());
    return start.getDay(); // 0 = شنبه
  }

  // فرمت تاریخ جلالی
  private formatJalali(date: Date, formatStr: string): string {
    // ساده شده — می‌تونی از date-fns-jalali استفاده کنی
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // فقط این متد رو اضافه کن
  calendarGrid = computed(() => {
    const start = startOfMonth(this.currentDate());
    const end = endOfMonth(this.currentDate());
    const days = eachDayOfInterval({ start, end });

    const firstDayOfWeek = start.getDay(); // 0 = شنبه
    const totalCells = 42; // 6 هفته × 7 روز
    const grid: (Date | null)[] = [];

    // فضای خالی قبل از روز اول
    for (let i = 0; i < firstDayOfWeek; i++) {
      grid.push(null);
    }

    // روزها
    days.forEach(day => grid.push(day));

    // فضای خالی بعد (تا ۴۲)
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
}
