import {Component} from '@angular/core';
import {InterviewSlotService} from './interview-slot.service';
import {FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormGroup, Validators} from '@angular/forms';
import {LoginService} from '../../login/login.service';
import {UserProfileService} from '../../user-profile/user-profile.service';
import {MainPageService} from '../../mainpagecomponent/main-page.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {NgForOf, NgIf} from '@angular/common';
import {formatJalaliDate} from '../../../share/utils/jalali-utils';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {JalaliDateFaPipe} from '../../../share/pipes/jalali-date.pipe';
import {PersianDigitsPipe} from '../../../share/pipes/persian-digits.pipe';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';

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
    NgIf,
    NzButtonComponent,
    NzIconDirective,
    RouterLink,
    JalaliDateFaPipe,
    PersianDigitsPipe,
    NzColDirective,
    NzRowDirective
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
  choiceTimeUser: any[] = [];
  selectedSchoolId: number | null = null;

  constructor(
    private mainPageService: MainPageService,
    private interviewSlotService: InterviewSlotService,
    private userProfileService: UserProfileService,
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
  ) {
  }

  ngOnInit(): void {

    this.mainPageService.currentTenant$.subscribe(tenantData => {
      if (tenantData) {
        this.tenantId = tenantData.tenantId;
        this.tenantSection = tenantData.section;
        this.theme = tenantData.theme;
        console.log('Theme loaded from service:', this.theme);
        return;
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

    this.loadTenantData();
    this.buildForm();

    this.interviewForm.get('schoolId')?.valueChanges.subscribe((schoolId: number) => {
      this.selectedSchoolId = schoolId;
      this.updateAvailableTimes(schoolId);
      this.interviewForm.get('slotId')?.reset();
    });

    this.loadSlots();
    this.loadDataUser();
  }

  loadDataUser(): void {
    this.userProfileService.loadData(this.tenantId).subscribe(res => {
        console.log('load user data : from inter slot : ', res.result);
        this.choiceTimeUser = res.result?.schoolInterviewSlots;
      },
      error => {
        console.log(error);
        this.createMessage('error', error.error.message);
        if (error.error.message === 'لطفا مجددا وارد برنامه شوید') {
          localStorage.clear();
        }
      });
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
          this.interviewForm.patchValue({schoolId: defaultSchoolId});
          this.updateAvailableTimes(defaultSchoolId);
        } else {
          this.availableTimes = [];
        }
      } else {
        console.error('خطا در دریافت اسلات‌ها:', response.error.message);
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
      .map(({id, date, time}) => ({id, date, time}));

    console.log('availableTimes با تاریخ شمسی:', this.availableTimes);
  }

  private parseTimeString(timeStr: string): { hour: number; minute: number } {
    const [hour, minute] = timeStr.split(':').map(Number);
    return {hour, minute: minute || 0};
  }

  createMessage(type: string, content: string): void {
    this.message.create(type, content);
  }

  protected visible = false;

  onSubmit(): void {
    if (this.interviewForm.invalid) {
      this.createMessage('warning', 'لطفا مدرسه و زمان را به درستی انتخاب کنید.')
      return;
    }

    const selectedSlotId = this.interviewForm.value.slotId;
    const selectedSlot = this.slots.find(slot => slot.id === selectedSlotId);
    if (!selectedSlot) {
      this.createMessage('warning', 'لطفا مدرسه و زمان را به درستی انتخاب کنید.')
      return;
    }

    const gregDate = new Date(selectedSlot.interviewDate);
    const jalaliDateStr = formatJalaliDate(gregDate);

    const startTimeStr = selectedSlot.startTime.substring(0, 5);
    const endTimeStr = selectedSlot.endTime.substring(0, 5);

    const parseTimeToObject = (timeStr: string) => {
      const [hour, minute] = timeStr.split(':').map(Number);
      return {hour, minute};
    };

    const requestBody = {
      id: selectedSlot.id,
      tenantId: this.tenantId || 0,
      periodId: selectedSlot.periodId || 0,
      schoolId: selectedSlot.schoolId || 0,
      interviewDate: selectedSlot.interviewDate,
      startTime: null,
      endTime: null,
      startTimeString: startTimeStr,
      endTimeString: endTimeStr,
      applicantId: selectedSlot.applicantId,
      concurrencyStamp: selectedSlot.concurrencyStamp || null
    };

    console.log('بدنه ارسالی:', requestBody);

    this.interviewSlotService.reservationInterviewSlots(requestBody).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.createMessage('success', 'عملیات با موفقیت انجام شد.');

          this.loadDataUser();

          this.visible = true;

          this.interviewForm.disable();
        } else {
          this.createMessage('error', response.error?.message || 'خطا در ثبت زمان');
        }
      },
      error: (err) => {
        console.error('خطای سرور:', err);
        this.createMessage('error', err.error?.message || 'خطای سرور');
      }
    });


    // this.interviewSlotService.reservationInterviewSlots(requestBody).subscribe({
    //   next: (response: any) => {
    //     if (response.success) {
    //       this.createMessage('success', 'عملیات با موفقیت انجام شد.');
    //       this.visible = true;
    //       // window.location.reload();
    //       // this.router.navigate([`/info/${this.tenantId}`]);
    //       // this.loadSlots();
    //     } else {
    //       alert('خطا: ' + (response.error?.message || 'نامشخص'));
    //     }
    //   },
    //   error: (err) => {
    //     console.error('خطای سرور:', err);
    //     this.createMessage('error', err.error.message);
    //
    //   }
    // });
  }
}
