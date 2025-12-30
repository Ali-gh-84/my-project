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
} from 'date-fns-jalali';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {gregorianToJalali, toPersianDigits} from '../../utils/jalali-utils';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import jalaali from 'jalaali-js';
import {MainPageService} from '../../../module/mainpagecomponent/main-page.service';


@Component({
  selector: 'app-jalali-calendar',
  imports: [
    CommonModule, FormsModule, NzIconModule, NzButtonComponent
  ],
  standalone: true,
  templateUrl: './jalali-calendar.component.html',
  styleUrl: './jalali-calendar.component.css'
})
export class JalaliCalendarComponent {

  currentDate = signal<Date>(new Date());
  selectedDate = signal<Date | null>(null);
  theme: any = {};
  tenantSection!: number;
  tenantId!: number;
  @Input() set date(value: Date | null) {
    if (value) {
      this.selectedDate.set(value);
      this.currentDate.set(value);
    }
  }

  @Output() dateChange = new EventEmitter<Date>();

  constructor(private mainPageService: MainPageService) {
  }

  ngOnInit() {
    const stored = this.mainPageService.getCurrentTenantFromStorage();

    if (stored) {
      this.tenantId = stored.tenantId;
      this.tenantSection = stored.section;
      this.theme = stored.theme;
      console.log('theme', this.theme);
      document.documentElement.style.setProperty(
        '--primary-color',
        this.theme.primary
      );

      this.mainPageService.setCurrentTenant(stored.tenantId, stored.section);
    }
  }

  private toJalali(date: Date): [number, number, number] {
    return gregorianToJalali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
  }

  private toGregorian(jy: number, jm: number, jd: number): Date {
    const {gy, gm, gd} = jalaali.toGregorian(jy, jm, jd);
    return new Date(gy, gm - 1, gd);
  }

  jalaliYear = computed(() => {
    const [jy] = this.toJalali(this.currentDate());
    return jy;
  });

  jalaliMonthIndex = computed(() => {
    const [, jm] = this.toJalali(this.currentDate());
    return jm; // index select
  });

  monthName = computed(() => {
    const [, jm] = this.toJalali(this.currentDate());
    return this.persianMonths[jm - 1];
  });

  days = computed(() => {
    const start = startOfMonth(this.currentDate());
    const end = endOfMonth(this.currentDate());
    return eachDayOfInterval({start, end});
  });

  calendarGrid = computed(() => {
    const start = startOfMonth(this.currentDate());
    const end = endOfMonth(this.currentDate());
    const days = eachDayOfInterval({start, end});

    const firstDay = start.getDay();
    const grid: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) grid.push(null);
    days.forEach(d => grid.push(d));
    while (grid.length < 42) grid.push(null);

    return grid;
  });

  persianMonths = [
    'ماه ...',
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند'
  ];

  years = Array.from({length: 60}, (_, i) => 1350 + i);

  weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  iranHolidays = [
    '1404-01-01',
    '1404-01-02',
    '1404-01-03',
    '1404-01-04',
    '1404-01-13'
  ];

  onYearChange(event: Event) {
    const jy = Number((event.target as HTMLSelectElement).value);
    const [, jm, jd] = this.toJalali(this.currentDate());
    this.currentDate.set(this.toGregorian(jy, jm, Math.min(jd, 29)));
  }

  onMonthChange(event: Event) {
    const jm = Number((event.target as HTMLSelectElement).value);
    const [jy, , jd] = this.toJalali(this.currentDate());
    this.currentDate.set(this.toGregorian(jy, jm, Math.min(jd, 29)));
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

  isSelected(cell: Date | null): boolean {
    return !!cell && !!this.selectedDate() && isSameDay(cell, this.selectedDate()!);
  }

  isToday(cell: Date | null): boolean {
    return !!cell && isSameDay(cell, new Date());
  }

  isHoliday(cell: Date | null): boolean {
    if (!cell) return false;
    const [jy, jm, jd] = this.toJalali(cell);
    const key = `${jy}-${String(jm).padStart(2, '0')}-${String(jd).padStart(2, '0')}`;
    return this.iranHolidays.includes(key);
  }

  toJalaliDayPersian(date: Date): string {
    const [, , jd] = this.toJalali(date);
    return toPersianDigits(jd);
  }

  toPersianDigits(value: string | number): string {
    return toPersianDigits(value);
  }
}
