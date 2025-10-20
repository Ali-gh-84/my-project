import { Component } from '@angular/core';
import {NzButtonModule, NzButtonSize} from 'ng-zorro-antd/button';
import {CommonModule, NgFor, NgIf} from '@angular/common';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-mainpage-component',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    NgIf,
    NzGridModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    RouterModule
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {

  size: NzButtonSize = 'large';

  Data: any = [
    {
      title: 'داوطلبین سطح 2',
      btn1: 'صفحه شخصی داوطلبین',
      btn2: 'ثبت نام',
      btn3: 'ظرفیت پذیرش',
      icon: 'user'
    },
    {
      title: 'داوطلبین سطح 3',
      btn1: 'صفحه شخصی داوطلبین',
      btn2: 'ثبت نام',
      btn3: 'ظرفیت پذیرش',
      icon: 'team'
    },
    {
      title: 'داوطلبین سطح 4',
      btn1: 'صفحه شخصی داوطلبین',
      btn2: 'ثبت نام',
      btn3: 'ظرفیت پذیرش',
      icon: 'crown'
    }
  ];
}
