import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { LoginService } from '../login/login.service';
import { MainPageService } from '../mainpagecomponent/main-page.service';
import { UserProfileService } from './user-profile.service';
import { formatJalaliDate } from '../../share/utils/jalali-utils';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {PrintDataService} from '../register-options/print-data/print-data.service';
import {MinioService} from '../../core/services/minio.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzInputDirective,
    ReactiveFormsModule,
    NzFormDirective,
    NzRowDirective,
    NzColDirective,
    NzButtonComponent,
    RouterLink,
    NzIconDirective,
    NzAvatarComponent,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {

  User: any = {};
  profilePicture: SafeUrl | null = null;
  profileForm!: UntypedFormGroup;

  theme: any;
  tenantId: number | null = null;
  tenantSection: number | null = null;
  isDisabled: boolean = false;
  path!: any;
  pathPicture!: any;

  private subscription = new Subscription();

  constructor(
    private loginService: LoginService,
    private userProfileService: UserProfileService,
    private mainPageService: MainPageService,
    private printDataService: PrintDataService ,
    private minioService: MinioService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.mainPageService.currentTenant$.subscribe(tenantData => {
        if (tenantData) {
          this.tenantId = tenantData.tenantId;
          this.tenantSection = tenantData.section;
          this.theme = tenantData.theme;
        }
      })
    );

    if (this.tenantId) {
      this.mainPageService.getPeriodInformation(this.tenantId).subscribe(res => {
        if (res.result?.isInterviewTimeSelectionEnabled) {
          this.isDisabled = true;
        }
      });
    }

    const stored = this.mainPageService.getCurrentTenantFromStorage();
    if (stored) {
      this.tenantId = stored.tenantId;
      this.tenantSection = stored.section;
      this.theme = stored.theme;
      this.mainPageService.setCurrentTenant(stored.tenantId, stored.section);
    } else {
      this.router.navigate(['/']);
      return;
    }

    this.buildForm();

    this.userProfileService.loadData(this.tenantId).subscribe({
      next: (response: any) => {
        console.log('data user profile : ', response.result);

        const r = response.result || response;

        let jalaliBirthDate: string | null = null;
        if (r.birthDate) {
          const gregDate = new Date(r.birthDate);
          jalaliBirthDate = formatJalaliDate(gregDate);
        }

        let jalaliInterviewDate: string | null = null;
        if (r.schoolInterviewSlots?.[0]?.interviewDate) {
          const interviewDate = new Date(r.schoolInterviewSlots[0].interviewDate);
          jalaliInterviewDate = formatJalaliDate(interviewDate);
        }

        this.User = {
          fullName: `${r.name || ''} ${r.family || ''}`.trim(),
          nationalId: r.nationalCode,
          birthCertificate: r.birthCertificateNumber,
          birthDate: jalaliBirthDate,
          mobile: r.cellphone,
          email: r.email,
          maritalStatus: r.isMarried ? 'متأهل' : 'مجرد',
          address: r.address,
          educationMethod: r.schoolField?.educationMethodTitle,
          description: r.description,
          civilStatus: r.civilRegistryInquiryStatus,
          seatNumber: r.examSeatNumber,
          examScore: r.examScore,
          rawExamScore: r.rawExamScore,
          academicScore: r.academicScore,
          interviewScore: r.interviewScore,
          city: r.city?.name,
          province: r.province?.name,
          files: r.files || [],
          interviewDate: jalaliInterviewDate,
          interviewStartTime: r.schoolInterviewSlots?.[0]?.startTime,
          interviewEndTime: r.schoolInterviewSlots?.[0]?.endTime,
          interviewSchool: r.schoolInterviewSlots?.[0]?.school?.name,
        };


        this.printDataService.updateUserInfo({
          name: r.name,
          family: r.family,
          nationalCode: r.nationalCode,
          phoneNumber: r.cellphone,
          email: r.email,
        });

        if (r.files && r.files.length > 0 && r.files[0]?.url) {
          this.minioService.getDownloadUrl(r.files[0].url).subscribe({
            next: (res: any) => {
              this.path = res.result;
            },
            error: (err) => {
              console.error('خطا در دریافت URL:', err);
            }
          });
        }

        this.patchForm();
      },
      error: (err) => {
        console.error('خطا در دریافت اطلاعات پروفایل:', err);
      }
    });

    this.profileForm.disable();
  }

  buildForm() {
    this.profileForm = this.fb.group({
      nationalId: [''],
      birthCertificate: [''],
      birthDate: [null],
      mobile: [''],
      email: [''],
      maritalStatus: [''],
      province: [''],
      city: [''],
      address: [''],
      educationMethod: [''],
      description: [''],
      civilStatus: [''],
      seatNumber: [''],
      examScore: [''],
      rawExamScore: [''],
      academicScore: [''],
      interviewScore: [''],
      interviewDate: [''],
      interviewStartTime: [''],
      interviewEndTime: [''],
      interviewSchool: [''],
    });
  }

  patchForm() {
    if (!this.User) return;

    this.profileForm.patchValue({
      nationalId: this.User.nationalId,
      birthCertificate: this.User.birthCertificate,
      birthDate: this.User.birthDate,
      mobile: this.User.mobile,
      email: this.User.email,
      maritalStatus: this.User.maritalStatus,
      province: this.User.province,
      city: this.User.city,
      address: this.User.address,
      educationMethod: this.User.educationMethod,
      description: this.User.description,
      civilStatus: this.User.civilStatus,
      seatNumber: this.User.seatNumber,
      examScore: this.User.examScore,
      rawExamScore: this.User.rawExamScore,
      academicScore: this.User.academicScore,
      interviewScore: this.User.interviewScore,
      interviewDate: this.User.interviewDate,
      interviewStartTime: this.User.interviewStartTime,
      interviewEndTime: this.User.interviewEndTime,
      interviewSchool: this.User.interviewSchool,
    });
  }

  goTo(): void {
    if (this.tenantId) {
      this.router.navigate([`interview-slot/${this.tenantId}`]);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
