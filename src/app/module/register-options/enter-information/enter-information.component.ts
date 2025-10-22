import {Component, EventEmitter, Output} from '@angular/core';
import {NzCollapseModule} from 'ng-zorro-antd/collapse';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
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
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {NzConfigService} from 'ng-zorro-antd/core/config';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {connect} from 'rxjs/operators';
import {isValidNationalCode, isValidPhoneNumber} from '../../../share/helpers/help';


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
  @Output() nextStep2 = new EventEmitter<void>();
  data: any;
  panels: any[] = [];
  size: NzButtonSize = 'large';

  optionsScore = [
    'حافظ 5 تا 15 جزء قرآن کريم',
    'حافظ بيش از 15جزء قرآن کريم',
    'حافظ حداقل نصف نهج البلاغه و بيشتر',
    'حافظ حداقل نصف صحيفه سجاديه و بيشتر',
    'خانواده شهدا و ايثارگران (شهيد، آزاده و جانباز بالای 25%)',
  ];

  optionsExemptions = [
    'حافظ كل قرآن كريم يا نهج البلاغه يا صحيفه سجاديه',
    'نفرات اول تا سوم هر رشته از المپيادهاي علمي كشوري كه از زمان كسب رتبه آنان بيش از سه سال نگذشته باشد',
    'دارندگان مدرك ديپلم با حداقل معدل كل 17 به استثناي مدرك ديپلم كار و دانش',
    'طرح زندگي با حوزه',
    'قبولي آزمون سال 1403',
    'دارندگان مدارك دانشگاهي با حداقل معدل 17',
    'كميسيون',
  ];

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

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private nzConfig: NzConfigService) {
    this.nzConfig.set('message', {nzTop: 80});
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
          numberCertificate: ['', [Validators.required, Validators.pattern(/^[0-9]{1,10}$/)]],
          nationalCode: ['', [Validators.required, isValidNationalCode]],
          birthday: ['', Validators.required],
          job: ['', [Validators.required]],
          married: ['', Validators.required],
          phoneHome: ['', [Validators.required, Validators.pattern(/^0\d{2,3}\d{8}$/)]],
          mobilePhone: ['', [Validators.required, isValidPhoneNumber]],
          email: ['', [Validators.required, Validators.email]],
          relegion: ['', Validators.required],
          hand: ['', Validators.required],
          importPhone: ['', [Validators.required, isValidPhoneNumber]],
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
          totalAverage: ['', [Validators.required, Validators.min(0), Validators.max(20)]],
          graduationYear: ['', [Validators.required, Validators.min(1300), Validators.max(1404)]],
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
          scores: this.fb.array(this.optionsScore.map(() => this.fb.control(false)))
        }),
      },
      {
        name: 'معافیت ها',
        active: false,
        form: this.fb.group({
          exemptions: this.fb.array(this.optionsExemptions.map(() => this.fb.control(false)))
        }),
      },
    ];
  }

  createMessage(type: string, content: string): void {
    this.message.create(type, content);
  }

  resetForm() {
    this.panels.forEach((p) => {
      p.form.reset()
    })
  }

  goNext(i: number): void {
    const currentPanel = this.panels[i];

    if (currentPanel.form.invalid) {
      Object.values(currentPanel.form.controls).forEach(control => {
      });
      this.createMessage('error', 'لطفا فیلد های ستاره دار را تکمیل نمایید')
      return;
    }

    currentPanel.active = false;

    if (i + 1 < this.panels.length) {
      this.panels[i + 1].active = true;
    }
  }

  nextStep() {
    this.nextStep2.emit();
  }

  submitAll() {
    const mergedData: any = {};
    let allValid = true;

    this.panels.forEach((p) => {
      if (p.form.valid) {
        if (p.name === 'امتیاز ها') {
          const scoresArray = p.form.get('scores') as FormArray;
          const selectedScores = this.optionsScore.filter((_, i) => scoresArray.value[i]);
          mergedData.scores = selectedScores;
        }
        else if (p.name === 'معافیت ها') {
          const exemptionsArray = p.form.get('exemptions') as FormArray;
          const selectedExemptions = this.optionsExemptions.filter((_, i) => exemptionsArray.value[i]);
          mergedData.exemptions = selectedExemptions;
        }
        else {
          Object.assign(mergedData, p.form.value);
        }

      } else {
        allValid = false;

        Object.keys(p.form.controls).forEach((key) => {
          const control = p.form.get(key);
          if (control) {
            control.markAsTouched();
            control.updateValueAndValidity();
          }
        });
      }
    });

    if (allValid) {
      this.createMessage('success', 'اطلاعات با موفقیت ثبت شد');
      console.log('mergedData:', mergedData);
      this.data = mergedData;

      this.resetForm();
      this.nextStep()

    } else {
      this.createMessage('error', 'لطفا فیلد های ستاره دار را تکمیل نمایید');
    }
  }
}
