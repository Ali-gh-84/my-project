import { Component } from '@angular/core';
import { NzListComponent, NzListItemComponent } from 'ng-zorro-antd/list';
import { CommonModule } from '@angular/common';
import { LoginService } from '../login/login.service';
import {JalaliDateFaPipe} from '../../share/pipes/jalali-date.pipe';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    NzListComponent,
    NzListItemComponent,
    JalaliDateFaPipe,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {

  User: any = {};
  avatarUrl: string = '';

  constructor(private loginService: LoginService) {}

  ngOnInit() {
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
    }
  }

  getImageUrl(path: string): string {
    const baseUrl = 'https://your-api-domain.com/files/';
    return baseUrl + path;
  }
}
