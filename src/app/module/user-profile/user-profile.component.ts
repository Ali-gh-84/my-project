import { Component } from '@angular/core';
import { NzListComponent, NzListItemComponent } from 'ng-zorro-antd/list';
import { CommonModule } from '@angular/common';
import { LoginService } from '../login/login.service';
import {JalaliDateFaPipe} from '../../share/pipes/jalali-date.pipe';
import {MainPageService} from '../mainpagecomponent/main-page.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ReactiveFormsModule, UntypedFormGroup} from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NzDatePickerComponent} from 'ng-zorro-antd/date-picker';

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
    NzDatePickerComponent,
    NzFormDirective,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {

  User: any = {};
  avatarUrl: string = '';
  theme: any = {};
  tenantSection!: number;
  tenantId!: number;
  profileForm!: UntypedFormGroup;


  constructor(
    private loginService: LoginService,
    private mainPageService: MainPageService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute) {}

  ngOnInit() {
    this.buildForm();

    const tenantId = this.route.snapshot.paramMap.get('tenantId');
    const tid = Number(tenantId);
    this.tenantId = tid;

    if (!tenantId || isNaN(tid)) {
      this.router.navigate(['/']);
      return;
    }

    this.mainPageService.getTenantList().subscribe(cards => {
      const currentTenant = cards.find(c => +c.id === tid || c.section === tid);
      if (currentTenant) {
        this.tenantSection = currentTenant.section;
        this.theme = this.mainPageService.getTenantTheme(this.tenantSection);
      }
    });

    const res: any = this.loginService.getUserDataProfile();

    if (res) {
      const r = res.result ?? res;

      this.User = {
        fullName: `${r.name || ''} ${r.family || ''}`.trim(),
        nationalId: r.nationalCode,
        birthCertificate: r.birthCertificateNumber,
        birthDate: r.birthDate,
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
    }
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
