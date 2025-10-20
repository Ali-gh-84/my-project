import {Component, EventEmitter, Output} from '@angular/core';
import {NzCollapseModule} from 'ng-zorro-antd/collapse';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzButtonModule, NzButtonSize} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';
import {en_US, NzI18nService, zh_CN} from 'ng-zorro-antd/i18n';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {ValidationComponent} from '../../../validator/validation/validation.component';
import {NzMessageService} from 'ng-zorro-antd/message';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import {NzConfigService} from 'ng-zorro-antd/core/config';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import {connect} from 'rxjs/operators';


@Component({
  selector: 'app-enter-information',
  standalone: true,
  imports: [
    NzCollapseModule,
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
    NzDatePickerModule,
    NzSelectModule,
    ValidationComponent,
    NzAlertModule
  ],
  templateUrl: './enter-information.component.html',
  styleUrl: './enter-information.component.css'
})
export class EnterInformationComponent {
  // @Output() nextStep2 = new EventEmitter<void>();
  panels: any[] = [];
  size: NzButtonSize  = 'large';

  // personalInfoForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private nzConfig: NzConfigService) {
    this.nzConfig.set('message', { nzTop: 80 });
  }

  ngOnInit() {
    this.panels = [
      {
        name: 'اطلاعات فردی',
        active: true,
        form: this.fb.group({
          firstName: ['', [Validators.required]],
          lastName: ['', [Validators.required]],
          fatherName: ['', [Validators.required]],
          nationality: ['', [Validators.required]],
          numberCertificate: ['', [Validators.required]],
          nationalCode: ['', [Validators.required]],
          birthday: ['', Validators.required],
          job: ['', [Validators.required]],
          married: ['', Validators.required],
          phoneHome: ['', Validators.required],
          mobilePhone: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]],
          relegion: ['', Validators.required],
          hand: ['', Validators.required],
          importPhone: ['', Validators.required],
        }),
      },
      {
        name: 'محل سکونت',
        active: false,
        form: this.fb.group({
          country: ['', Validators.required],
          city: ['', [Validators.required]],
          getKnow: ['', [Validators.required]],
        }),
      },
      {
        name: 'تحصیلات غیر حوزوی',
        active: false,
        form: this.fb.group({
          degree: ['', Validators.required],
          statusDegree: ['', [Validators.required]],
          diplomaCourse: ['', [Validators.required]],
          totalAverage: ['', [Validators.required]],
          graduationYear: ['', [Validators.required]],
          typeCourse: ['', [Validators.required]],
          provinceSchool: ['', [Validators.required]],
          citySchool: ['', [Validators.required]],
          school: ['', [Validators.required]],
          typePresence: ['', [Validators.required]],
          provinceTest: ['', [Validators.required]],
          cityTest: ['', [Validators.required]],
          centerTest: ['', [Validators.required]],
        }),
      },
      {
        name: 'امتیاز ها',
        active: false,
        form: this.fb.group({
          scores: [[]],
        }),
      },
      // {
      //   name: 'معافبت ها',
      //   active: false,
      //   form: this.fb.group({
      //     phone: ['', [Validators.required, Validators.pattern(/^09\d{9}$/)]],
      //     email: ['', [Validators.required, Validators.email]],
      //   }),
      // },
    ];
  }

  cityAndCountry: any = [
    {
      name: "قم",
      id: "قم"
    },
    {
      name: "تهران",
      id: "تهران"
    },
    {
      name: "اصفهان",
      id: "اصفهان"
    },
    {
      name: "شیراز",
      id: "شیراز"
    }, {
      name: "گیلان",
      id: "گیلان"
    },
  ]

  createMessage(type: string, content: string): void {
    this.message.create(type, content);
  }

  resetForm() {
    this.panels.forEach((p) => {
      p.form.reset()
    })
  }

  submitAllForms() {
    const mergedData: any = {};
    let allValid = true;
    this.panels.forEach((p) => {
      if (p.form.valid) {
        Object.assign(mergedData, p.form.value);
      } else {
        allValid = false;
        Object.keys(p.form.controls).forEach((key) => {
          p.form.get(key)?.markAsTouched();
        });
      }
    });

    if (allValid) {
      console.log("Final object:", mergedData);
      this.createMessage('success', 'اطلاعات با موفقیت ثبت شد');
      this.resetForm()
      // this.apiService.submitAll(mergedData).subscribe(...)
    } else {
      console.warn("Some forms are invalid");
      this.createMessage('error', 'لطفا فیلد های ستاره دار را تکمیل نمایید')
    }
  }

  options = [
    'حافظ 5 تا 15 جزء قرآن کريم',
    'حافظ بيش از 15جزء قرآن کريم',
    'حافظ حداقل نصف نهج البلاغه و بيشتر',
    'حافظ حداقل نصف صحيفه سجاديه و بيشتر',
    'خانواده شهدا و ايثارگران (شهيد، آزاده و جانباز بالای 25%)',
  ];

  selected = new Set<string>();

  toggle(option: string) {
    if (this.selected.has(option)) {
      this.selected.delete(option);
      // this.panels.forEach((p) => {
      //   p.form.get('scores').pop(option)
      // })
    } else {
      this.selected.add(option);
      // this.panels.forEach((p) => {
      //   p.form.get('scores').push(option)
      // })
    }
  }

  submitAllFormsStep(p: any) {
    // if(this.panels.forEach((i) => {
    //   i.form.valid
    // }))
    p.active = !p.active;
  }
}
