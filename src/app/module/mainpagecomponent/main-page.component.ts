import {Component} from '@angular/core';
import {NzButtonModule, NzButtonSize} from 'ng-zorro-antd/button';
import {CommonModule, NgFor} from '@angular/common';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {Router, RouterModule} from '@angular/router';
import {MainPageModel} from './main-page-model';
import {PersianDigitsPipe} from '../../share/pipes/persian-digits.pipe';

@Component({
  selector: 'app-main-page-component',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    NzGridModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    RouterModule,
    PersianDigitsPipe
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {

  size: NzButtonSize = 'large';

  Data: MainPageModel = [
    {
      title: 'داوطلبین سطح',
      degree: '2',
      buttons: [
        {
          text: 'صفحه شخصی داوطلبین',
          color: '#4ca6a7',
          bgcolor: '#ffffff',
          action: 'personalPage'
        },
        {
          text: 'ثبت نام',
          color: '#ffffff',
          bgcolor: '#7FD8DE',
          action: 'register'
        },
        {
          text: 'ظرفیت پذیرش',
          color: '#ffffff',
          bgcolor: '#4CA6A7',
          action: 'capacity'
        }
      ],
      img: './assets/pictures/user-2.png',
      overlay: 'rgba(234, 248, 249, 0.5)',
      colorText: '#4CA6A7',
      size: '14px',
      weight: 'lighter'
    },
    {
      title: 'داوطلبین سطح',
      degree: '3',
      buttons: [
        {
          text: 'صفحه شخصی داوطلبین',
          color: '#834E6F',
          bgcolor: '#ffffff',
          action: 'personalPage'
        },
        {
          text: 'ثبت نام',
          color: '#ffffff',
          bgcolor: '#E0A8CB',
          action: 'register'
        },
        {
          text: 'ظرفیت پذیرش',
          color: '#ffffff',
          bgcolor: '#AC7196',
          action: 'capacity'
        }
      ],
      img: './assets/pictures/user-3.png',
      overlay: 'rgba(249, 233, 243, 0.5)',
      colorText: '#AC7196',
      size: '14px',
      weight: 'lighter'
    },
    {
      title: 'داوطلبین سطح',
      degree: '4',
      buttons: [
        {
          text: 'صفحه شخصی داوطلبین',
          color: '#9FC497',
          bgcolor: '#ffffff',
          action: 'personalPage'
        },
        {
          text: 'ثبت نام',
          color: '#ffffff',
          bgcolor: '#B2DAAA',
          action: 'register'
        },
        {
          text: 'ظرفیت پذیرش',
          color: '#ffffff',
          bgcolor: '#83B778',
          action: 'capacity'
        }
      ],
      img: './assets/pictures/user-4.png',
      overlay: 'rgba(235, 249, 232, 0.5)',
      colorText: '#83B778',
      size: '14px',
      weight: 'lighter'
    }
  ];

  constructor(private router: Router) {
  }

  onButtonClick(action: string, item: any) {
    const level = item.degree;

    const routesMap: { [key: string]: string } = {
      personalPage: level === '2' ? '/personal-info' : '/info',
      register: '/register',
      capacity: '/reception'
    };

    const path = routesMap[action];

    if (path) {
      this.router.navigate([path]);
    } else {
      console.warn('مسیر پیدا نشد برای اکشن:', action);
    }
  }
}
