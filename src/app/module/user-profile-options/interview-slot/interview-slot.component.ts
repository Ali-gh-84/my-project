import {Component} from '@angular/core';
import {InterviewSlotService} from './interview-slot.service';
import {FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormGroup, Validators} from '@angular/forms';
import {LoginService} from '../../login/login.service';
import {UserProfileService} from '../../user-profile/user-profile.service';
import {MainPageService} from '../../mainpagecomponent/main-page.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {NgForOf, NgIf} from '@angular/common';
import {formatJalaliDate} from '../../../share/utils/jalali-utils';

@Component({
  selector: 'app-interview-slot',
  imports: [
    NzFormDirective,
    ReactiveFormsModule,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzSelectComponent,
    NzOptionComponent,
    NgForOf,
    NgIf
  ],
  templateUrl: './interview-slot.component.html',
  styleUrl: './interview-slot.component.css'
})
export class InterviewSlotComponent {

  theme: any;
  tenantId: number | null = null;
  tenantSection: number | null = null;

  interviewForm!: FormGroup;
  slots: any[] = [];
  uniqueSchools: any[] = [];
  availableTimes: any[] = [];
  selectedSchoolId: number | null = null;

  constructor(
    private mainPageService: MainPageService,
    private interviewSlotService: InterviewSlotService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTenantData();
    this.buildForm();

    this.interviewForm.get('schoolId')?.valueChanges.subscribe((schoolId: number) => {
      this.selectedSchoolId = schoolId;
      this.updateAvailableTimes(schoolId);
      this.interviewForm.get('slotId')?.reset();
    });

    this.loadSlots();
  }

  private loadTenantData(): void {
    this.mainPageService.currentTenant$.subscribe(tenantData => {
      if (tenantData) {
        this.tenantId = tenantData.tenantId;
        this.tenantSection = tenantData.section;
        this.theme = tenantData.theme;
      }
    });

    const stored = this.mainPageService.getCurrentTenantFromStorage();
    if (stored) {
      this.tenantId = stored.tenantId;
      this.tenantSection = stored.section;
      this.theme = stored.theme;
      this.mainPageService.setCurrentTenant(stored.tenantId, stored.section);
    } else {
      this.router.navigate(['/']);
    }
  }

  buildForm(): void {
    this.interviewForm = this.fb.group({
      schoolId: [null, Validators.required],
      slotId: [null, Validators.required]
    });
  }

  loadSlots(): void {
    if (!this.tenantId) return;

    this.interviewSlotService.getInterviewSlots(this.tenantId).subscribe((response: any) => {
      if (response.success) {
        this.slots = response.result || [];
        console.log('slots loaded:', this.slots);

        const schoolMap = new Map<number, any>();
        this.slots.forEach(slot => {
          if (!schoolMap.has(slot.schoolId)) {
            schoolMap.set(slot.schoolId, slot.school);
          }
        });
        this.uniqueSchools = Array.from(schoolMap.values());

        if (this.uniqueSchools.length > 0) {
          const defaultSchoolId = this.uniqueSchools[0].id;
          this.interviewForm.patchValue({ schoolId: defaultSchoolId });
          this.updateAvailableTimes(defaultSchoolId);
        } else {
          this.availableTimes = [];
        }
      } else {
        console.error('خطا در دریافت اسلات‌ها:', response.error);
      }
    });
  }

  updateAvailableTimes(schoolId: number): void {
    const filteredSlots = this.slots
      .filter(slot => slot.schoolId === schoolId);

    this.availableTimes = filteredSlots
      .map(slot => {
        const gregDate = new Date(slot.interviewDate);
        return {
          id: slot.id,
          date: formatJalaliDate(gregDate),
          time: `${slot.startTime.substring(0, 5)} تا ${slot.endTime.substring(0, 5)}`,
          rawDate: gregDate
        };
      })
      .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
      .map(({ id, date, time }) => ({ id, date, time }));

    console.log('availableTimes با تاریخ شمسی:', this.availableTimes);
  }

  private parseTimeString(timeStr: string): { hour: number; minute: number } {
    const [hour, minute] = timeStr.split(':').map(Number);
    return { hour, minute: minute || 0 };
  }

  onSubmit(): void {
    if (this.interviewForm.invalid) {
      alert('لطفاً مدرسه و زمان مصاحبه را انتخاب کنید');
      return;
    }

    const selectedSlotId = this.interviewForm.value.slotId;
    const selectedSlot = this.slots.find(slot => slot.id === selectedSlotId);
    if (!selectedSlot) {
      alert('اسلات معتبر نیست!');
      return;
    }

    const gregDate = new Date(selectedSlot.interviewDate);
    const jalaliDateStr = formatJalaliDate(gregDate);

    const startTimeStr = selectedSlot.startTime.substring(0, 5);
    const endTimeStr = selectedSlot.endTime.substring(0, 5);

    const parseTimeToObject = (timeStr: string) => {
      const [hour, minute] = timeStr.split(':').map(Number);
      return { hour, minute };
    };

    const requestBody = {
      id: 0,
      tenantId: this.tenantId || 0,
      periodId: selectedSlot.periodId || 0,
      schoolId: selectedSlot.schoolId || 0,
      interviewDate: selectedSlot.interviewDate,
      startTime: parseTimeToObject(startTimeStr),
      endTime: parseTimeToObject(endTimeStr),
      startTimeString: startTimeStr,
      endTimeString: endTimeStr,
      applicantId: selectedSlot.applicantId,
      concurrencyStamp: selectedSlot.concurrencyStamp || null
    };

    console.log('بدنه ارسالی:', requestBody);

    this.interviewSlotService.reservationInterviewSlots(requestBody).subscribe({
      next: (response: any) => {
        if (response.success) {
          alert('زمان مصاحبه با موفقیت رزرو شد!');
          this.loadSlots(); // رفرش لیست
        } else {
          alert('خطا: ' + (response.error?.message || 'نامشخص'));
        }
      },
      error: (err) => {
        console.error('خطای سرور:', err);
        alert('خطا در ارتباط با سرور');
      }
    });
  }

  // onSubmit(): void {
  //   if (this.interviewForm.invalid) {
  //     alert('لطفاً مدرسه و زمان مصاحبه را انتخاب کنید');
  //     return;
  //   }
  //
  //   const selectedSlotId = this.interviewForm.value.slotId;
  //
  //   // پیدا کردن اسلات انتخاب شده
  //   const selectedSlot = this.slots.find(slot => slot.id === selectedSlotId);
  //   if (!selectedSlot) {
  //     alert('اسلات معتبر نیست!');
  //     return;
  //   }
  //
  //   // تبدیل تاریخ میلادی به شمسی (یا میلادی بسته به نیاز backend)
  //   const gregDate = new Date(selectedSlot.interviewDate);
  //   const jalaliDateStr = formatJalaliDate(gregDate); // مثلاً "1404/09/22"
  //   // اگر backend میلادی می‌خواد: const interviewDateStr = gregDate.toISOString().split('T')[0]; // "2025-12-13"
  //
  //   // فرمت زمان: "10:57:00" → "10:57"
  //   const formatTime = (timeStr: string) => timeStr.substring(0, 5);
  //
  //   const requestBody = {
  //     id: 4,
  //     tenantId: this.tenantId,
  //     periodId: selectedSlot.periodId,
  //     schoolId: selectedSlot.schoolId,
  //     interviewDate: jalaliDateStr,           // حتماً null
  //     startTime: selectedSlot.startTime.substring(0, 5),
  //     endTime: selectedSlot.endTime.substring(0, 5),
  //     // startTime : {
  //     //   hour: selectedSlot.startTime.substring(0, 2),
  //     //   minute: selectedSlot.startTime.substring(3, 5),
  //     // },               // حتماً null
  //     // endTime : {
  //     //   hour: selectedSlot.endTime.substring(0, 2),
  //     //   minute: selectedSlot.endTime.substring(3, 5),
  //     // },                  // حتماً null
  //     applicantId: selectedSlot.applicantId  ,            // backend خودش پر می‌کنه
  //     concurrencyStamp: selectedSlot.concurrencyStamp || null      // اگر لازم بود اضافه کن
  //   };
  //
  //   console.log('بدنه ارسالی برای رزرو:', requestBody);
  //
  //   this.interviewSlotService.reservationInterviewSlots(requestBody).subscribe({
  //     next: (response: any) => {
  //       if (response.success) {
  //         alert('زمان مصاحبه با موفقیت رزرو شد!');
  //         this.loadSlots(); // لیست رو دوباره لود کن تا اسلات رزرو شده حذف بشه
  //       } else {
  //         alert('خطا در رزرو: ' + (response.error?.message || 'نامشخص'));
  //       }
  //     },
  //     error: (err) => {
  //       console.error('خطای سرور:', err);
  //       alert('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
  //     }
  //   });
  // }
}
