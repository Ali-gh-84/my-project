import {Component} from '@angular/core';
import {NzListComponent, NzListItemComponent} from 'ng-zorro-antd/list';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    NzListItemComponent,
    NzListComponent,
    NzTypographyComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {

  User: any =
    {
      id: 1,
      fullName: 'علی علی اکبرزاده',
      nationalId: '0372846661',
      birthCertificate: '1520220',
      birthDate: '1384/07/10',
      province: 'قم',
      city: 'قم',
      maritalStatus: 'مجرد'
    }
}
