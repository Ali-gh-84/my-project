import { Component } from '@angular/core';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzStepsModule} from 'ng-zorro-antd/steps';
import {ImportantOptionComponent} from '../register-options/important-option/important-option.component';
import {RegisterSerialComponent} from '../register-options/register-serial/register-serial.component';
import {EnterInformationComponent} from '../register-options/enter-information/enter-information.component';

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [
    NzButtonModule,
    NzStepsModule,
    ImportantOptionComponent,
    RegisterSerialComponent,
    EnterInformationComponent
  ],
  templateUrl: './wizard.component.html',
  styleUrl: './wizard.component.css'
})
export class WizardComponent {

  current = 0;

  steps: any[] = [
    { title: 'نکات مهم', icon: 'info-circle' },
    { title: 'سریال ثبت نام', icon: 'key' },
    { title: 'ورود اطلاعات', icon: 'edit' },
    { title: 'بارگذاری مدارک', icon: 'upload' },
    { title: 'چاپ اطلاعات', icon: 'fund' }
  ]

  next(): void {
    this.current += 1;
  }

  pre(): void {
    this.current -= 1;
  }

  done(): void {
    console.log('ثبت اطلاعات انجام شد!');
  }
}
