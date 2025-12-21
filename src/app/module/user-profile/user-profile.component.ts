import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginService} from '../login/login.service';
import {MainPageService} from '../mainpagecomponent/main-page.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ReactiveFormsModule, UntypedFormGroup} from '@angular/forms';
import {FormBuilder} from '@angular/forms';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {JalaliDatePickerComponent} from '../../share/components/jalali-date-picker/jalali-date-picker.component';
import {UserProfileService} from './user-profile.service';

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
    JalaliDatePickerComponent,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {

  User: any = {};
  avatarUrl: string = '';
  profileForm!: UntypedFormGroup;
  theme: any;
  tenantId: number | null = null;
  tenantSection: number | null = null;


  constructor(
    private loginService: LoginService,
    private userProfileService: UserProfileService,
    private mainPageService: MainPageService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute) {
  }

  ngOnInit() {

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

    this.buildForm();

    this.userProfileService.loadData(this.tenantId).subscribe({
      next: (response: any) => {
        console.log('داده از سرور دریافت شد:', response);

        const r = response.result || response;

        // let birthDateValue: Date | null = null;
        // if (r.birthDate) {
        //   birthDateValue = new Date(r.birthDate);
        //    new Date(r.birthDate + 'T00:00:00');
        // }
        let jalaliBirthDate: string | null = null;
        if (r.birthDate) {
          const gregDate = new Date(r.birthDate);
          jalaliBirthDate = formatJalaliDate(gregDate);
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
          files: r.files || []
        };

        const avatar = this.User.files.find((f: any) => f.name === 'تصویر شخصی');
        this.avatarUrl = avatar ? avatar.url : '';

        this.patchForm();
      },
      error: (err) => {
        console.error('خطا در دریافت اطلاعات پروفایل:', err);
      },
      complete: () => {
        console.log('درخواست پروفایل کامل شد');
      }
    });
  }

  getImageUrl(path: string): string {
    const baseUrl = 'https://your-api-domain.com/files/';
    return baseUrl + path;
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
      interviewScore: ['']
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
      interviewScore: this.User.interviewScore
    });
  }
}
