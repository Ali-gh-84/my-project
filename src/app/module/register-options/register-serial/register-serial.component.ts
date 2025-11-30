import {Component, EventEmitter, Output} from '@angular/core';
import {NzButtonModule, NzButtonSize} from 'ng-zorro-antd/button';
import {FormGroup, FormsModule, Validators} from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {ImportantOptionService} from '../important-option/important-option.service';
import {MainPageService} from '../../mainpagecomponent/main-page.service';
import {NzInputDirective} from 'ng-zorro-antd/input';


@Component({
  selector: 'app-register-serial',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzFormModule,
    NzModalModule,
    NzCheckboxModule,
    NzInputDirective
  ],
  templateUrl: './register-serial.component.html',
  styleUrl: './register-serial.component.css'
})
export class RegisterSerialComponent {

  @Output() nextStep1 = new EventEmitter<void>();
  serialForm!: FormGroup;
  size: NzButtonSize  = 'large';
  theme: any = {};
  tenantSection!: number;
  text: string = '';


  buttonInfo: any[] = [
    {
      title: 'سریال کارت خرید ثبت نام',
      icon: ''
    },
    {
      title: 'مرحله بعد',
      icon: ''
    },
  ]

  Data: any[] = [
    {
      title: 'نكات قابل توجه:',
      description: '1- هر داوطلب فقط يك مرتبه مي تواند ثبت نام نمايد.\n' +
        '2- در صورت نياز به تكميل يا ويرايش اطلاعات مي توانيد با همين سريال كارت ثبت نام، مجددا وارد سامانه شويد.\n' +
        '3- پس از وارد كردن كد رهگيري، گزينه مرحله بعد را انتخاب نماييد.'
    },
  ]

  constructor(private fb: FormBuilder,
              private importantOptionService: ImportantOptionService,
              private mainPageService: MainPageService,
              private route: ActivatedRoute,
              private router: Router,) {
  }

  private getThemedButtons(section: number): any[] {
    const t = this.mainPageService.getTenantTheme(section);
    return [
      {name: 'فهرست مدارس علمیه', icon: 'solution', bg: t.light, color: '#ffffff'},
      {name: 'دفترچه راهنما', icon: 'file-search', bg: t.primary, color: '#ffffff'},
      {name: 'خرید کارت ثبت نام', icon: 'shopping-cart', bg: t.medium, color: '#ffffff'},
      {name: 'پیگیری کارت ثبت نام', icon: 'search', bg: t.high, color: '#ffffff'},
    ];
  }

  ngOnInit() {
    const tenantId = this.route.snapshot.paramMap.get('tenantId');
    const tid = +tenantId!;

    if (!tenantId || isNaN(tid)) {
      this.router.navigate(['/']);
      return;
    }

    this.mainPageService.getTenantList().subscribe(cards => {
      const currentTenant = cards.find(c => +c.id === tid || c.section === tid);
      if (currentTenant) {
        this.tenantSection = currentTenant.section;
        this.theme = this.mainPageService.getTenantTheme(this.tenantSection);
        this.buttonInfo = this.getThemedButtons(this.tenantSection);
      }
    });

    this.createForm();
  }

  createForm() {
    this.serialForm = this.fb.group({
      serial: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    });
  }

  get form() {
    return this.serialForm;
  }

  resetForm() {
    this.serialForm.reset();
  }

  nextStep() {
    this.nextStep1.emit();
  }
}
