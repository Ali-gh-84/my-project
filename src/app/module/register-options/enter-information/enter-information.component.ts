import {Component, EventEmitter, Input, Output, TrackByFunction} from '@angular/core';
import {NzCollapseModule} from 'ng-zorro-antd/collapse';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzButtonModule, NzButtonSize} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {ValidationComponent} from '../../../validator/validation/validation.component';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {NzConfigService} from 'ng-zorro-antd/core/config';
import {isValidNationalCode, isValidPhoneNumber} from '../../../share/helpers/help';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {JalaliCalendarComponent} from '../../../share/components/jalali-calendar/jalali-calendar.component';
import {JalaliDatePickerComponent} from '../../../share/components/jalali-date-picker/jalali-date-picker.component';
import {PersianDigitsPipe} from '../../../share/pipes/persian-digits.pipe';
import {PrintDataService} from '../print-data/print-data.service';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {CityCountry, FieldConfig} from './enter-information-model';
import {EnterInformationService} from './enter-information.service';
import {formatJalaliDate, jalaliStringToDate} from '../../../share/utils/jalali-utils';


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
    NzAlertModule,
    NzDescriptionsModule,
    JalaliDatePickerComponent,
    ReactiveFormsModule,
    NzDividerModule
  ],
  templateUrl: './enter-information.component.html',
  styleUrl: './enter-information.component.css'
})
export class EnterInformationComponent {
  @Output() nextStep2 = new EventEmitter<void>();
  @Input() data: any = {};
  // panels: any[] = [];
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

  cityAndCountry: CityCountry[] = [
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
    private nzConfig: NzConfigService,
    private enterInformationService: EnterInformationService,
    private printDataService: PrintDataService) {
    this.nzConfig.set('message', {nzTop: 80});
  }

  panels: any[] = [];
  // cityAndCountry: CityCountry[] = [];          // از سرویس می‌آید
  private cityOptions: any[] = [];    // یک‌بار محاسبه می‌شود

  // trackBy برای *ngFor
  trackPanel: TrackByFunction<any> = (i, p) => p.name;
  trackField: TrackByFunction<any> = (i, f) => f.controlName;
  trackOption: TrackByFunction<any> = (i, o) => o.value;


  ngOnInit() {
    this.loadCities();                // فرضاً از API
    this.buildPanels();
  }

  private loadCities() {
    // this.api.getCities().subscribe((data: CityCountry[]) => {
    //   this.cityAndCountry = data;
    //   this.cityOptions = data.map(c => ({ value: c.name, label: c.id }));
    // });
    // برای تست:
    this.cityAndCountry = [{id: 1, name: 'تهران'}, {id: 2, name: 'اصفهان'}];
    this.cityOptions = this.cityAndCountry.map(c => ({value: c.name, label: c.id}));
  }

  private buildPanels() {
    this.panels = [
      // اعتبار سنجی کاربر
      {
        name: 'دریافت اطلاعات کاربر',
        active: true,
        form: this.fb.group({
          nationalCode: ['', [Validators.required, isValidNationalCode]],
          jalaliBirthDate: ['', Validators.required],
        }),
        fields: [
          {controlName: 'nationalCode', label: 'کد ملی', type: 'text', required: true},
          {controlName: 'jalaliBirthDate', label: 'تاریخ تولد', type: 'date', required: true},
        ]
      },
      // 1. اطلاعات فردی
      {
        name: ' اطلاعات فردی',
        active: false,
        form: this.fb.group({
          name: ['', Validators.required],
          family: ['', Validators.required],
          fatherName: ['', Validators.required],
          nationality: ['', Validators.required],
          shenasnameSerial: ['', [Validators.required, Validators.pattern(/^[0-9]{1,10}$/)]],
          nationalCode: ['', [Validators.required, isValidNationalCode]],
          jalaliBirthDate: ['', Validators.required],
          job: ['', Validators.required],
          married: ['', Validators.required],
          phoneHome: ['', [Validators.required, Validators.pattern(/^0\d{2,3}\d{8}$/)]],
          mobilePhone: ['', [Validators.required, isValidPhoneNumber]],
          email: ['', [Validators.required, Validators.email]],
          relegion: ['', Validators.required],
          hand: ['', Validators.required],
          importPhone: ['', [Validators.required, isValidPhoneNumber]],
        }),
        fields: [
          {controlName: 'name', label: 'نام', type: 'text', required: true},
          {controlName: 'family', label: 'نام خانوادگی', type: 'text', required: true},
          {controlName: 'fatherName', label: 'نام پدر', type: 'text', required: true},
          {controlName: 'nationality', label: 'تابعیت', type: 'text', required: true},
          {controlName: 'shenasnameSerial', label: 'شماره شناسنامه', type: 'text', required: true},
          {controlName: 'nationalCode', label: 'کد ملی', type: 'text', required: true},
          {controlName: 'jalaliBirthDate', label: 'تاریخ تولد', type: 'date', required: true},
          {controlName: 'job', label: 'شغل', type: 'text', required: true},
          {
            controlName: 'married', label: 'وضعیت تاهل', type: 'select', required: true, options: [
              {value: 'مجرد', label: 'مجرد'},
              {value: 'متاهل', label: 'متاهل'},
              {value: 'سایر', label: 'سایر'}
            ]
          },
          {controlName: 'phoneHome', label: 'تلفن ثابت', type: 'tel', required: true},
          {controlName: 'mobilePhone', label: 'تلفن همراه', type: 'tel', required: true},
          {controlName: 'email', label: 'پست الکترونیک', type: 'email', required: true},
          {
            controlName: 'relegion', label: 'مذهب', type: 'select', required: true, options: [
              {value: 'شیعه', label: 'شیعه'},
              {value: 'سنی', label: 'سنی'}
            ]
          },
          {
            controlName: 'hand', label: 'چپ دست', type: 'select', required: true, options: [
              {value: 'هستم', label: 'هستم'},
              {value: 'نیستم', label: 'نیستم'}
            ]
          },
          {controlName: 'importPhone', label: 'شماره تلفن ضروری', type: 'tel', required: true},
        ]
      },

      // 2. محل سکونت
      {
        name: 'محل سکونت',
        active: false,
        form: this.fb.group({
          country: ['', Validators.required],
          city: ['', Validators.required],
          getKnow: ['', Validators.required],
        }),
        fields: [
          {
            controlName: 'country',
            label: 'کشور',
            type: 'select',
            required: true,
            options: () => this.cityAndCountry.map(c => ({value: c.name, label: c.id}))
          },
          {
            controlName: 'city',
            label: 'شهر',
            type: 'select',
            required: true,
            options: () => this.cityAndCountry.map(c => ({value: c.name, label: c.id}))
          },
          {
            controlName: 'getKnow',
            label: 'نحوه آشنایی شما با حوزه علمیه خواهران از چه طریق بوده است؟',
            type: 'select',
            required: true,
            options: [
              {value: 'از طریق فضای مجازی', label: 'از طریق فضای مجازی'},
              {value: 'از طریق طلاب حوزه خواهران', label: 'از طریق طلاب حوزه خواهران'},
              {value: 'از طریق خانواده، دوستان و آشنایان', label: 'از طریق خانواده، دوستان و آشنایان'},
              {value: 'از طریق رسانه (تلویزیون، رادیو و...)', label: 'از طریق رسانه (تلویزیون، رادیو و...)'},
              {value: 'از طریق تبلیغات شهری (بنر، پوستر و..)', label: 'از طریق تبلیغات شهری (بنر، پوستر و..)'},
              {
                value: 'از طریق ارتباط با حوزه های علمیه خواهران و بهره مندی از برنامه های آن',
                label: 'از طریق ارتباط با حوزه های علمیه خواهران و بهره مندی از برنامه های آن'
              }
            ]
          }
        ]
      },

      // 3. تحصیلات غیر حوزوی
      {
        name: 'تحصیلات غیر حوزوی',
        active: false,
        form: this.fb.group({
          degree: ['', Validators.required],
          statusDegree: ['', Validators.required],
          diplomaCourse: ['', Validators.required],
          totalAverage: ['', [Validators.required, Validators.min(0), Validators.max(20)]],
          graduationYear: ['', [Validators.required, Validators.min(1300), Validators.max(1404)]],
          typeCourse: ['', Validators.required],
          provinceSchool: ['', Validators.required],
          citySchool: ['', Validators.required],
          school: ['', Validators.required],
          typePresence: ['', Validators.required],
          provinceTest: ['', Validators.required],
          cityTest: ['', Validators.required],
          centerTest: ['', Validators.required],
        }),
        fields: [
          {
            controlName: 'degree', label: 'مقطع تحصیلی', type: 'select', required: true, options: [
              {value: 'سیکل', label: 'سیکل'},
              {value: 'دیپلم', label: 'دیپلم'}
            ]
          },
          {
            controlName: 'statusDegree', label: 'وضعیت تحصیلی', type: 'select', required: true, options: [
              {value: 'اتمام', label: 'اتمام'},
              {value: 'اشتغال', label: 'اشتغال'}
            ]
          },
          {
            controlName: 'diplomaCourse', label: 'رشته دیپلم', type: 'select', required: true, options: [
              {value: 'ریاضی', label: 'ریاضی'},
              {value: 'تجربی', label: 'تجربی'},
              {value: 'انسانی', label: 'انسانی'}
            ]
          },
          {controlName: 'totalAverage', label: 'معدل کل', type: 'number', required: true, min: 0, max: 20},
          {
            controlName: 'graduationYear',
            label: 'سال فارغ التحصیلی',
            type: 'number',
            required: true,
            min: 1300,
            max: 1404
          },
          {
            controlName: 'typeCourse', label: 'نوع دوره', type: 'select', required: true, options: [
              {value: 'دیپلم تمام وقت', label: 'دیپلم تمام وقت'}
            ]
          },
          {
            controlName: 'provinceSchool',
            label: 'استان',
            type: 'select',
            required: true,
            options: () => this.cityAndCountry.map(c => ({value: c.name, label: c.id}))
          },
          {
            controlName: 'citySchool',
            label: 'شهر',
            type: 'select',
            required: true,
            options: () => this.cityAndCountry.map(c => ({value: c.name, label: c.id}))
          },
          {
            controlName: 'school', label: 'مدرسه', type: 'select', required: true, options: [
              {value: 'فاطمیه', label: 'فاطمیه'}
            ]
          },
          {
            controlName: 'typePresence', label: 'نوع حضور', type: 'select', required: true, options: [
              {value: 'خوابگاهی', label: 'خوابگاهی'},
              {value: 'روزانه', label: 'روزانه'}
            ]
          },
          {
            controlName: 'provinceTest',
            label: 'استان',
            type: 'select',
            required: true,
            options: () => this.cityAndCountry.map(c => ({value: c.name, label: c.id}))
          },
          {
            controlName: 'cityTest',
            label: 'شهر',
            type: 'select',
            required: true,
            options: () => this.cityAndCountry.map(c => ({value: c.name, label: c.id}))
          },
          {
            controlName: 'centerTest', label: 'مرکز آزمون', type: 'select', required: true, options: [
              {value: 'فاطمیه', label: 'فاطمیه'}
            ]
          }
        ],
        extraTexts: [
          {text: 'دوره 5 ساله(ویژه دارندگان مدرک دیپلم و بالاتر)', after: 'graduationYear'},
          {text: 'مدرسه انتخابی (نزدیکترین مدرسه به محل سکونت)', after: 'typeCourse'},
          {text: 'مرکز آزمون', after: 'typePresence'}
        ]
      },

      // 4. امتیاز ها
      {
        name: 'امتیاز ها',
        active: false,
        form: this.fb.group({
          scores: this.fb.array(this.optionsScore.map(() => this.fb.control(false)))
        }),
        fields: [
          {
            controlName: 'scores',
            label: 'امتیازات',
            type: 'checkbox-group',
            hint: 'داوطلب گرامی: در صورت داشتن امتیازات ویژه، مدارک مربوطه را در زمان مصاحبه به مدرسه علمیه انتخابی خود تحویل دهید.',
            options: () => this.optionsScore
          }
        ]
      },

      // 5. معافیت ها
      {
        name: 'معافیت ها',
        active: false,
        form: this.fb.group({
          exemptions: this.fb.array(this.optionsExemptions.map(() => this.fb.control(false)))
        }),
        fields: [
          {
            controlName: 'exemptions',
            label: 'معافیت‌ها',
            type: 'checkbox-group',
            options: () => this.optionsExemptions
          }
        ]
      }
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

  private fillNextPanelWithUserData(nextIndex: number, userData: any) {
    const nextPanel = this.panels[nextIndex];
    if (!nextPanel) return;

    let formattedBirthDate = '';
    if (userData.jalaliBirthDate) {
      const dateObj = jalaliStringToDate(userData.jalaliBirthDate);
      if (dateObj) {
        formattedBirthDate = formatJalaliDate(dateObj);
      }
    }

    console.log('داده‌های پر شده:', userData, formattedBirthDate);

    if (nextPanel.name === ' اطلاعات فردی') {
      nextPanel.form.patchValue({
        name: userData.name || '',
        family: userData.family || '',
        fatherName: userData.fatherName || '',
        nationalCode: userData.nationalCode || '',
        shenasnameSerial: userData.shenasnameSerial || '',
        jalaliBirthDate: userData.jalaliBirthDate || '',
      });
    }
  }

  goNext(i: number) {
    const currentPanel = this.panels[i];

    if (currentPanel.name === 'دریافت اطلاعات کاربر') {
      if (!currentPanel.form.valid) {
        this.createMessage('error', 'لطفاً فیلد های ستاره دار تکمیل شود.');
        return;
      }

      const {nationalCode, jalaliBirthDate} = currentPanel.form.value;

      this.enterInformationService.getDataUser(nationalCode, jalaliBirthDate).subscribe({
        next: (res: any) => {
          const userData = res?.result || {};

          const fullData = {
            nationalCode,
            jalaliBirthDate,
            ...userData
          };

          this.fillNextPanelWithUserData(i + 1, fullData);

          this.panels[i].active = false;
          this.panels[i + 1].active = true;

          this.createMessage('success', 'اطلاعات با موفقیت دریافت شد');
        },
        error: (err) => {
          console.error('خطا در دریافت اطلاعات:', err);
          this.panels[i].active = false;
          this.panels[i + 1].active = true;
          // this.createMessage('error', 'کاربر یافت نشد یا خطایی رخ داد');
        }
      });
    } else {
      if (currentPanel.form.valid) {
        this.panels[i].active = false;
        this.panels[i + 1].active = true;
      }
      this.createMessage('error', 'لطفاً فیلد های ستاره دار تکمیل شود.');
    }
  }

  nextStep() {
    this.nextStep2.emit();
  }

  getSelectedOptions(field: any, selectedValues: boolean[]): any[] {
    const options = this.getOptions(field);
    return options
      .filter((_, index) => selectedValues[index])
      .map(opt => (typeof opt === 'string' ? opt : opt.value || opt.label));
  }

  submitAll() {
    const mergedData: any = {};
    let allValid = true;

    this.panels.forEach((panel) => {
      if (!panel.form.valid) {
        allValid = false;
        return;
      }

      panel.fields.forEach((field: any) => {
        const control = panel.form.get(field.controlName);
        if (field.type === 'checkbox-group') {
          const formArray = control as FormArray;
          const selectedOptions = this.getSelectedOptions(field, formArray.value);
          mergedData[field.controlName] = selectedOptions;
        } else {
          mergedData[field.controlName] = control?.value;
        }
      });
    });

    if (!allValid) {
      this.createMessage('error', 'لطفا فیلدهای ستاره‌دار را تکمیل نمایید');
      return;
    }

    this.createMessage('success', 'اطلاعات با موفقیت ثبت شد');

    const printInfo = {
      name: mergedData.name,
      family: mergedData.family,
      fatherName: mergedData.fatherName,
      nationalCode: mergedData.nationalCode,
      phoneNumber: mergedData.mobilePhone,
      email: mergedData.email
    };

    console.log('data is : ', mergedData)
    this.printDataService.updateUserInfo(printInfo);
    this.nextStep();
  }

  getOptions(field: any): any[] {
    if (typeof field.options === 'function') {
      return field.options();
    }
    return field.options || [];
  }
}
