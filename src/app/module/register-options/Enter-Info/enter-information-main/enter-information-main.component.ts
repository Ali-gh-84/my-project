import {Component, EventEmitter, inject, Input, Output, TrackByFunction} from '@angular/core';
import {CommonModule, NgForOf, NgIf} from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {NzCollapseComponent, NzCollapseModule, NzCollapsePanelComponent} from 'ng-zorro-antd/collapse';
import {NzButtonComponent, NzButtonModule} from 'ng-zorro-antd/button';
import { Router } from '@angular/router';
import {UserVerificationPanelComponent} from '../components/user-verification-panel/user-verification-panel.component';
import {PersonalInfoPanelComponent} from '../components/personal-info-panel/personal-info-panel.component';

@Component({
  selector: 'app-enter-information-main',
  imports: [
    NzCollapseComponent,
    NzCollapsePanelComponent,
    NgForOf,
    NgIf,
    NzButtonComponent,
    UserVerificationPanelComponent,
    PersonalInfoPanelComponent
  ],
  templateUrl: './enter-information-main.component.html',
  styleUrl: './enter-information-main.component.css'
})
export class EnterInformationMainComponent {

  @Output() nextStep2 = new EventEmitter<void>();
  @Input() data: any = {};
  private fb = inject(FormBuilder); // به جای constructor

  // این آرایه بعداً خیلی کوچیک‌تر میشه، فعلاً فقط برای تست نگهش می‌داریم
  panels = [
    {
      name: 'دریافت اطلاعات کاربر',
      active: true,
      form: this.fb.group({
        nationalCode: [''],
        jalaliBirthDate: ['']
      })
    },
    {
      name: ' اطلاعات فردی',
      active: false,
      form: this.fb.group({
        name: [''],
        family: [''],
        // ... بقیه فیلدها بعداً میان
      })
    }
    // ... بقیه پنل‌ها بعداً اضافه میشن
  ];

  loadingPanels: boolean[] = [false, false, false, false, false, false];

  trackPanel: TrackByFunction<any> = (index: number, panel: any) => panel.name;

  constructor(
    private router: Router
  ) {}

  // این متد توسط پنل اول فراخوانی میشه
  goNext(currentIndex: number) {
    console.log('دکمه ادامه زده شد از پنل', currentIndex);

    // اینجا بعداً منطق اصلی goNext() رو می‌ریزیم
    // فعلاً فقط پنل بعدی رو فعال می‌کنیم
    this.panels.forEach((p, i) => p.active = i === currentIndex + 1);
  }

  // برای تست موقت — بعداً حذف میشه
  submitAll() {
    console.log('ثبت نهایی زده شد');
    this.nextStep2.emit();
  }
}
