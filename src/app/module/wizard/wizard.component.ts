import { Component } from '@angular/core';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzStepsModule} from 'ng-zorro-antd/steps';
import {ImportantOptionComponent} from '../register-options/important-option/important-option.component';
import {RegisterSerialComponent} from '../register-options/register-serial/register-serial.component';
import {UploadFileComponent} from '../register-options/upload-file/upload-file.component';
import {PrintDataComponent} from '../register-options/print-data/print-data.component';
import {EnterInformationComponent} from '../register-options/enter-information/enter-information.component';
import {NgClass, NgStyle} from '@angular/common';

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [
    NzButtonModule,
    NzStepsModule,
    ImportantOptionComponent,
    RegisterSerialComponent,
    UploadFileComponent,
    PrintDataComponent,
    EnterInformationComponent,
    NgClass,
  ],
  templateUrl: './wizard.component.html',
  styleUrl: './wizard.component.css'
})
export class WizardComponent {

  current = 0;

  steps: any[] = [
    { title: 'نکات مهم', icon: 'info-circle' }, // <nz-icon nzType="info-circle" nzTheme="outline" />
    { title: 'سریال ثبت نام', icon: 'scan' }, // <nz-icon nzType="scan" nzTheme="outline" />
    { title: 'ورود اطلاعات', icon: 'file-text' }, // <nz-icon nzType="file-text" nzTheme="outline" />
    { title: 'بارگذاری مدارک', icon: 'idcard' }, // <nz-icon nzType="idcard" nzTheme="outline" />
    { title: 'چاپ اطلاعات', icon: 'printer' } // <nz-icon nzType="printer" nzTheme="outline" />
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
