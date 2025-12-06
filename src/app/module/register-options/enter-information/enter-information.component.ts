import {
  Component,
  ElementRef,
  EventEmitter, inject,
  Input,
  Output,
  QueryList,
  TrackByFunction,
  ViewChildren
} from '@angular/core';
import {NzCollapseModule} from 'ng-zorro-antd/collapse';
import {CommonModule} from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors, ValidatorFn,
  Validators
} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
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
import {isValidNationalCode, isValidPhoneNumber, maxAgeValidator} from '../../../share/helpers/help';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {JalaliDatePickerComponent} from '../../../share/components/jalali-date-picker/jalali-date-picker.component';
import {PrintDataService} from '../print-data/print-data.service';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {dataKeep} from './enter-information-model';
import {EnterInformationService} from './enter-information.service';
import {combineLatest, of, race, take, timer} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {NzTableComponent} from 'ng-zorro-antd/table';
import {MainPageService} from '../../mainpagecomponent/main-page.service';
import {ImportantOptionService} from '../important-option/important-option.service';
import moment from 'moment-jalaali';
import {FileUploaderComponent} from '../../../share/components/file-uploader/file-uploader.component';
import {MinioService} from '../../../core/services/minio.service';
import {RegisterSerialService} from '../register-serial/register-serial.service';

moment.loadPersian({dialect: 'persian-modern', usePersianDigits: true});

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
    NzDividerModule,
    NzTableComponent,
    FileUploaderComponent,
  ],
  templateUrl: './enter-information.component.html',
  styleUrl: './enter-information.component.css'
})
export class EnterInformationComponent {
  private fb = inject(FormBuilder);

  @Output() nextStep2 = new EventEmitter<void>();
  @Input() data: any = {};
  size: NzButtonSize = 'large';
  loadingPanels: boolean[] = [];
  ScoreItems: { id: number; name: string }[] = [];
  exemptionItems: { id: number; name: string; documentSubmission: boolean }[] = [];
  @Input() uploadFileForm!: FormGroup;
  previews: { [key: string]: string | null } = {};
  loading: { [key: string]: boolean } = {};
  educationHistory: any[] = [];
  tenantSection: any;
  tenantId!: number;
  periodId!: number;
  scoreFilesForm = this.fb.group({});
  exemptionFilesForm = this.fb.group({});

  @ViewChildren('fileInput') set fileInputs(inputs: QueryList<ElementRef>) {
    inputs.forEach(input => {
    });
  }

  constructor(
    private message: NzMessageService,
    private nzConfig: NzConfigService,
    private enterInformationService: EnterInformationService,
    private printDataService: PrintDataService,
    private mainPageService: MainPageService,
    private minioService: MinioService,
    private importantOptionService: ImportantOptionService,
    private registerSerialService: RegisterSerialService,
    private route: ActivatedRoute,
    private router: Router,) {
    this.nzConfig.set('message', {nzTop: 80});
  }

  theme: any = {};
  panels: any[] = [];
  private provinceOptions: any[] = [];
  private cityOptions: any[] = [];
  private fieldOptions: any[] = [];
  private subFieldOptions: any[] = [];
  private schoolOptions: any[] = [];
  private serialCode: any;
  maxAge!: number;
  para = {
    Filter: '',
    Page: 1,
    PageCount: 30,
  }

  trackPanel: TrackByFunction<any> = (i, p) => p.name;
  trackField: TrackByFunction<any> = (i, f) => f.controlName;
  trackOption: TrackByFunction<any> = (i, o) => o.value;

  ngOnInit() {
    this.loadProvinces();
    this.registerSerialService.serialCode$.subscribe(
      (serial) => {
        this.serialCode = serial;
        console.log('Serial code:', serial);
      }
    );

    const tenantIdFromRoute = this.route.snapshot.paramMap.get('tenantId');
    const tid = +tenantIdFromRoute!;

    if (!tenantIdFromRoute || isNaN(tid)) {
      this.router.navigate(['/']);
      return;
    }

    const periodInfo = this.mainPageService.periodInformations.value;

    if (periodInfo && periodInfo.tenantId === tid) {
      console.log('yes')
      this.tenantId = periodInfo.tenantId;
      this.periodId = periodInfo.periodId;
      this.maxAge = periodInfo.maxAge;
      this.tenantSection = periodInfo.section;
    } else {
      this.tenantId = tid;
      this.tenantSection = tid;
    }

    this.mainPageService.getTenantList().subscribe(cards => {
      const currentTenant = cards.find(c => +c.id === tid || c.section === tid);
      if (currentTenant) {
        this.tenantSection = currentTenant.section;
        this.theme = this.mainPageService.getTenantTheme(this.tenantSection);
      }
    });
    console.log(this.theme, this.tenantSection);

    this.scoreFilesForm = this.fb.group({});
    this.exemptionFilesForm = this.fb.group({});
    this.buildPanels();
    this.loadingPanels = this.panels.map(() => false);
    this.loadScoreAndPrefill();
    this.loadExemptionsAndPrefill();
    this.loadFields();
    this.applyTheme();
  }

  applyTheme() {
    const root = document.documentElement;

    root.style.setProperty('--collapse-header-bg', this.theme.header);
    root.style.setProperty('--collapse-content-bg', this.theme.light);
  }

  selectedProvinceId: number | null = null;  // id استان انتخاب شده
  private loadProvinces() {
    this.enterInformationService.getAllProvince(this.para).subscribe({
      next: (provinces: any[]) => {
        this.provinceOptions = provinces;
        console.log('استان‌ها لود شد:', provinces);
      },
      error: (err) => {
        console.error('خطا در بارگذاری استان‌ها', err);
        this.createMessage('error', 'خطا در بارگذاری استان‌ها');
      }
    });
  }

  loadFields() {
    this.enterInformationService.getAllField(this.para, this.tenantId).subscribe({
      next: (fields: any[]) => {
        this.fieldOptions = fields;
        console.log('رشته‌ها لود شد:', fields);
      },
      error: (err) => {
        console.error('خطا در بارگذاری رشته‌ها', err);
        this.createMessage('error', 'خطا در بارگذاری رشته‌ها');
      }
    });
  }

  loadSchool() {
    const personalForm = this.panels[1]?.form;
    const studyForm = this.panels.find(p => p.name === 'انتخاب رشته')?.form;

    if (!personalForm || !studyForm) return;

    const provinceId = personalForm.get('province')?.value;
    const fieldId = studyForm.get('study')?.value;
    const subFieldId = studyForm.get('subStudy')?.value;

    if (!provinceId || !fieldId) {
      this.schoolOptions = [];
      return;
    }

    const selectedProvince = this.provinceOptions.find(p => p.id === provinceId);
    const provinceName = selectedProvince?.name;

    if (!provinceName) {
      console.warn('استان پیدا نشد برای آیدی:', provinceId);
      return;
    }

    this.enterInformationService.getAllSchool(provinceName, this.tenantId, fieldId, subFieldId).subscribe({
      next: (school: any[]) => {
        this.schoolOptions = school;
        console.log('مدارس لود شد:', school);
      },
      error: (err) => {
        console.error('خطا در بارگذاری مدارس', err);
        this.createMessage('error', 'خطا در بارگذاری مدارس');
      }
    });
  }

  onSelectChange(controlName: string, value: any) {
    if (controlName.includes('province') ||
      controlName === 'country' ||
      controlName === 'provinceSchool' ||
      controlName === 'provinceTest') {
      this.onProvinceChange(value);
    } else if (controlName === 'study') {
      this.onFieldChange(value);
    } else if (controlName === 'subStudy') {
      this.loadSchool();
    }
  }

  onProvinceChange(provinceId: number) {
    if (!provinceId) {
      this.cityOptions = [];
      return;
    }
    this.selectedProvinceId = provinceId;
    this.enterInformationService.getAllCities(this.para, provinceId).subscribe({
      next: (cities: any[]) => {
        this.cityOptions = cities;
        console.log('شهرهای استان', provinceId, ':', cities);
      },
      error: (err) => {
        console.error('خطا در بارگذاری شهرها', err);
        this.cityOptions = [];
        this.createMessage('error', 'خطا در بارگذاری شهرها');
      }
    });
  }

  onFieldChange(fieldId: number) {
    if (!fieldId) {
      this.subFieldOptions = [];
      return;
    }
    this.enterInformationService.getAllSubField(this.para, fieldId).subscribe({
      next: (subfields: any[]) => {
        this.subFieldOptions = subfields;
        console.log('زیررشته‌های رشته', fieldId, ':', subfields);
      },
      error: (err) => {
        console.error('خطا در بارگذاری زیررشته‌ها', err);
        this.subFieldOptions = [];
        this.createMessage('error', 'خطا در بارگذاری زیررشته‌ها');
      }
    });
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
          tenantId: this.tenantId,
          periodId: this.periodId,
          name: ['', Validators.required],
          family: ['', Validators.required],
          address: ['', Validators.required],
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
          province: ['', Validators.required],
          city: ['', Validators.required],
          getKnow: ['', Validators.required],
        }),
        fields: [
          {controlName: 'name', label: 'نام', type: 'text', required: true},
          {controlName: 'family', label: 'نام خانوادگی', type: 'text', required: true},
          {controlName: 'address', label: 'آدرس محل سکونت', type: 'text', required: true},
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
          {
            controlName: 'province',
            label: 'استان',
            type: 'select',
            required: true,
            options: () => this.provinceOptions.map(c => ({value: c.id, label: c.name}))
          },
          {
            controlName: 'city',
            label: 'شهر',
            type: 'select',
            required: true,
            options: () => this.cityOptions.map(c => ({value: c.id, label: c.name}))
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
      // 3. تسوابق تحصیلی
      {
        name: 'سوابق تحصیلی',
        active: false,
        showEducationHistory: false,
        form: this.fb.group({
          diplomaCourse: [''],
          average: [],
          endSemester: [],
          degreeEdu: [''],
          educationGrid: this.fb.array([]),
        }),
        fields: [
          {
            controlName: 'degreeEdu', label: 'مقطع تحصیلی', type: 'select', required: false, options: [
              {value: 'سیکل', label: 'سیکل'},
              {value: 'دیپلم', label: 'دیپلم'},
              {value: 'بالا تر از دیپلم', label: 'بالا دیپلم'}
            ]
          },
          {
            controlName: 'diplomaCourse', label: 'رشته', type: 'select', required: false, options: [
              {value: 'ریاضی', label: 'ریاضی'},
              {value: 'تجربی', label: 'تجربی'},
              {value: 'انسانی', label: 'انسانی'}
            ]
          },
          {controlName: 'average', label: 'معدل', type: 'number', required: false, min: 0, max: 20},
          {
            controlName: 'endSemester',
            label: 'سال فارغ التحصیلی',
            type: 'number',
            required: false,
            min: 1300,
            max: 1404
          },
        ],
      },
      // 3. انتخاب رشته
      {
        name: 'انتخاب رشته',
        active: false,
        form: this.fb.group({
          study: ['', [Validators.required]],
          subStudy: ['', [Validators.required]],
          schoolStudy: ['', [Validators.required]],
          centerExam: ['', [Validators.required]],
        }),
        fields: [
          {
            controlName: 'study',
            label: 'رشته',
            type: 'select',
            required: true,
            options: () => this.fieldOptions.map(f => ({value: f.id, label: f.name}))
          },
          {
            controlName: 'subStudy',
            label: 'زیر رشته',
            type: 'select',
            required: true,
            options: () => this.subFieldOptions.map(s => ({value: s.id, label: s.name}))
          },
          {
            controlName: 'schoolStudy',
            label: 'مدرسه',
            type: 'select',
            required: true,
            options: () => this.schoolOptions.map(s => ({value: s.id, label: s.name}))
          },
          {
            controlName: 'centerExam',
            label: 'مرکز آزمون',
            type: 'select',
            required: true,
            options: [
              {value: 1, label: 'قم'},
              {value: 2, label: 'تهران'},
            ]
          },
        ],
      },
      // 4. امتیاز ها
      {
        name: 'امتیاز ها',
        active: true,
        form: this.fb.group({
          scores: this.fb.array([])
        }),
        fields: [
          {
            controlName: 'scores',
            label: 'امتیازات',
            type: 'checkbox-group',
            // hint: 'داوطلب گرامی: در صورت داشتن امتیازات ویژه، مدارک مربوطه را در زمان مصاحبه به مدرسه علمیه انتخابی خود تحویل دهید.',
          }
        ]
      },
      // 5. معافیت ها
      {
        name: 'معافیت ها',
        active: true,
        form: this.fb.group({
          exemptions: this.fb.array([])
        }),
        fields: [
          {
            controlName: 'exemptions',
            label: 'معافیت‌ها',
            type: 'checkbox-group',
            // hint: 'در صورت داشتن معافیت، مدارک مربوطه را در زمان مصاحبه ارائه دهید.',
          }
        ]
      }
    ];
  }

  adjustEducationPanelForTenant() {
    const eduPanel = this.panels.find(p => p.name === 'سوابق تحصیلی');
    if (!eduPanel) return;

    // if (!this.uploadFileForm.contains('education_file')) {
    //   this.uploadFileForm.addControl('education_file', this.fb.control(null));
    // }

    if (this.tenantId === 4) {
      eduPanel.showEducationHistory = false;
      this.educationHistory = [];
      return eduPanel.showEducationHistory;
    }

    if (this.tenantId === 5 || this.tenantId === 6) {
      eduPanel.showEducationHistory = true;
      return eduPanel.showEducationHistory;
    }
  }

  onFileSelected(event: Event, controlName: string) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.loading[controlName] = true;

    const reader = new FileReader();
    reader.onload = () => {
      this.previews[controlName] = reader.result as string;
      this.uploadFileForm.get(controlName)?.setValue(file);
      this.loading[controlName] = false;

      this.updateAllCheckboxGroupValidations();
    };
    reader.readAsDataURL(file);

  }

  removeFile(controlName: string) {
    this.uploadFileForm.get(controlName)?.setValue(null);
    this.previews[controlName] = null;
    delete this.loading[controlName];

    this.updateAllCheckboxGroupValidations();
  }

  private updateAllCheckboxGroupValidations() {
    this.panels.forEach(panel => {
      if (panel.name === 'امتیاز ها' || panel.name === 'معافیت ها') {
        const arrayName = panel.name === 'امتیاز ها' ? 'scores' : 'exemptions';
        const formArray = panel.form.get(arrayName);
        if (formArray instanceof FormArray) {
          const validator = panel.name === 'امتیاز ها'
          // ? this.fileRequiredIfCheckedValidator(this.scoreFilesForm, 'scores')
          // : this.fileRequiredIfCheckedValidator(this.exemptionFilesForm, 'exemptions');

          // formArray.setValidators(validator);
          formArray.updateValueAndValidity();
          panel.form.updateValueAndValidity();
        }
      }
    });
  }

  openFileInput(id: string) {
    const el = document.getElementById(id) as HTMLInputElement;
    el?.click();
  }

  isCheckboxChecked(form: FormGroup, arrayName: string, index: number): boolean {
    try {
      const array = form.get(arrayName) as FormArray;
      if (!array || index >= array.length) {
        return false;
      }
      return array.at(index)?.value === true;
    } catch (error) {
      console.error(`خطا در بررسی checkbox ${arrayName}[${index}]`, error);
      return false;
    }
  }

  getOptions(field: any): { label: string; value: any }[] {
    if (field.controlName === 'city' ||
      field.controlName === 'citySchool' ||
      field.controlName === 'cityTest') {
      return this.cityOptions.map(c => ({label: c.name, value: c.id}));
    }
    if (field.controlName === 'province' ||
      field.controlName === 'provinceSchool' ||
      field.controlName === 'provinceTest') {
      return this.provinceOptions.map(p => ({label: p.name, value: p.id}));
    }
    if (field.controlName === 'exemptions') {
      return this.exemptionItems.map(item => ({label: item.name, value: item.id}));
    }
    if (field.controlName === 'scores') {
      return this.ScoreItems.map(item => ({label: item.name, value: item.id}));
    }
    if (typeof field.options === 'function') {
      return field.options();
    }
    if (field.options) {
      return field.options;
    }
    return [];
  }

  loadScoreAndPrefill() {
    this.enterInformationService.getAllScore(this.para).subscribe({
      next: (items: any[]) => {
        this.ScoreItems = items;

        const scorePanel = this.panels.find(p => p.name === 'امتیاز ها');
        if (!scorePanel) return;

        const scoresArray = scorePanel.form.get('scores') as FormArray;
        scoresArray.clear();

        items.forEach(item => {
          scoresArray.push(this.fb.control(false));
        });

        scoresArray.updateValueAndValidity();

        scorePanel.form.updateValueAndValidity();
      },
      error: (err: any) => {
        console.error('خطا در بارگذاری امتیاز ها', err);
        this.createMessage('error', 'خطا در بارگذاری امتیاز ها');
      }
    });
  }


  loadExemptionsAndPrefill() {
    // اگر متد لود معافیت‌ها دارید
    this.enterInformationService.getAllExemption(this.para).subscribe({
      next: (items: any[]) => {
        this.exemptionItems = items;

        const exemptionPanel = this.panels.find(p => p.name === 'معافیت ها');
        if (!exemptionPanel) return;

        const exemptionsArray = exemptionPanel.form.get('exemptions') as FormArray;
        exemptionsArray.clear();

        // ایجاد کنترل‌ها برای هر آیتم
        items.forEach(item => {
          exemptionsArray.push(this.fb.control(false));
        });

        // تنظیم validator
        // exemptionsArray.setValidators(this.fileRequiredIfCheckedValidator(this.exemptionFilesForm, 'exemptions'));
        exemptionsArray.updateValueAndValidity();

        exemptionPanel.form.updateValueAndValidity();
      },
      error: (err: any) => {
        console.error('خطا در بارگذاری معافیت ها', err);
      }
    });
  }

  createMessage(type: string, content: string): void {
    this.message.create(type, content);
  }

  resetForm() {
    this.panels.forEach((p) => {
      p.form.reset()
    })
  }

  editing: boolean = true;

  fillNextPanelWithUserData(nextIndex: number, userData: any) {
    const nextPanel = this.panels[nextIndex];
    const patchData: any = {};

    // personal user data
    if (userData.nationalCode) patchData.nationalCode = userData.nationalCode;
    if (userData.jalaliBirthDate) patchData.jalaliBirthDate = userData.jalaliBirthDate;
    if (userData.name) patchData.name = userData.name;
    if (userData.family) patchData.family = userData.family;
    if (userData.address) patchData.address = userData.address;
    if (userData.shenasnameSerial) patchData.shenasnameSerial = userData.shenasnameSerial;

    // education user data
    if (userData.lastEdu) {
      const edu = userData.lastEdu;

      if (edu.average) patchData.average = edu.average;
      if (edu.endSemester) patchData.endSemester = edu.endSemester;

      console.log("EDU FOUND:", edu);
    }
    nextPanel.form.patchValue(patchData);
  }

  goBack(i: number) {
    if (i === 0) return;
    this.panels.forEach((p, idx) => p.active = idx === i - 1);
  }

  goNext(i: number) {
    const currentPanel = this.panels[i];

    if (currentPanel.name !== 'دریافت اطلاعات کاربر') {
      if (currentPanel.form.valid) {
        this.activateNextPanel(i);
      } else {
        this.createMessage('error', 'لطفا فیلد ها را کامل پر کنید.');
      }
      return;
    }

    if (!currentPanel.form.valid) {
      this.createMessage('error', 'لطفاً فیلدهای ستاره‌دار را تکمیل کنید.');
      return;
    }

    const {nationalCode, jalaliBirthDate} = currentPanel.form.value;
    const userInfoKeeper: dataKeep = {nationalCode, jalaliBirthDate};
    this.enterInformationService.updateUserInfo(userInfoKeeper);

    if (!this.loadingPanels[i]) {
      this.loadingPanels[i] = true;
    }

    const api$ = combineLatest([
      this.enterInformationService.getDataUser(nationalCode, jalaliBirthDate)
        .pipe(catchError(() => of({result: {}}))),

      this.enterInformationService.getDataUserEducations(nationalCode)
        .pipe(catchError(() => of({result: []})))
    ]);

    race(
      api$.pipe(map(() => 'api')),
      timer(7000).pipe(map(() => 'timeout'))
    ).pipe(take(1))
      .subscribe((winner) => {
        this.activateNextPanel(i);
      });

    api$.subscribe({
      next: ([personal, education]) => {
        const userData = personal?.result || {};
        const eduData = Array.isArray(education?.result) ? education.result : [];

        if (userData.gender === 1) {
          this.createMessage('error', 'از پذیرفتن آقایان معذوریم.');
          this.router.navigate(['/']);
        }

        this.prefilledUserData = {
          name: userData.name,
          family: userData.family,
          shenasnameSerial: userData.shenasnameSerial,
          nationalCode: userData.nationalCode,
          jalaliBirthDate: userData.jalaliBirthDate
        };

        console.log('دیتای تحصیلات کاربر : ', eduData);
        this.educationHistory = eduData;
        const lastEdu = eduData.length > 0 ? eduData[eduData.length - 1] : null;
        const fullData = {...userInfoKeeper, ...userData, lastEdu};

        this.fillNextPanelWithUserData(i + 1, fullData);
        if (Object.keys(userData).length > 0 || eduData.length > 0) {
          this.disablePrefilledControls();
        }
        this.editing = false;
        this.loadingPanels[i] = false;
        this.adjustEducationPanelForTenant();
      },
      error: (err) => {
        console.error(err);
        this.loadingPanels[i] = false;
      }
    });
  }

  disablePrefilledControls() {
    const panelsToCheck = [this.panels[1], this.panels[3]];

    panelsToCheck.forEach(panel => {
      if (!panel) return;

      Object.keys(panel.form.controls).forEach(controlName => {
        const control = panel.form.get(controlName);

        if (control && control.value !== null && control.value !== undefined && control.value !== '') {
          if (Array.isArray(control.value)) {
            const hasTrue = control.value.some((val: any) => val === true);
            if (hasTrue) {
              control.disable({emitEvent: false});
            }
          } else {
            control.disable({emitEvent: false});
          }
        }
      });
    });
  }

  activateNextPanel(currentIndex: number) {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= this.panels.length) {
      return;
    }

    this.panels.forEach((panel, idx) => {
      panel.active = idx === nextIndex;
    });
  }

  nextStep() {
    this.nextStep2.emit();
  }

  getSelectedOptions(field: any, selectedValues: boolean[]): any[] {
    const options = this.getOptions(field);
    return options
      .filter((_, index) => selectedValues[index])
      .map(opt => opt.value || opt.label); // id یا name
  }

  private prefilledUserData: any = {};

  private convertJalaliToGregorian(jalaliDate: string): string {
    if (!jalaliDate) return new Date().toISOString();
    try {
      const cleaned = jalaliDate.replace(/-/g, '/');
      const m = moment(cleaned, 'jYYYY/jMM/jDD');
      if (!m.isValid()) return new Date().toISOString();
      return m.toDate().toISOString();
    } catch (e) {
      console.error('خطا در تبدیل تاریخ:', e);
      return new Date().toISOString();
    }
  }

  private mapHowMetUs(value: string): number {
    const map: { [key: string]: number } = {
      'از طریق فضای مجازی': 1,
      'از طریق طلاب حوزه خواهران': 2,
      'از طریق خانواده، دوستان و آشنایان': 3,
      'از طریق رسانه (تلویزیون، رادیو و...)': 4,
      'از طریق تبلیغات شهری (بنر، پوستر و..)': 5,
      'از طریق ارتباط با حوزه های علمیه خواهران و بهره مندی از برنامه های آن': 6
    };
    return map[value] || 1;
  }

  private mapCenterExam(value: string): number {
    return value === 'قم' ? 1 : value === 'تهران' ? 2 : 1;
  }

  submitAll() {

    const personalForm = this.panels.find(p => p.name.includes('اطلاعات فردی'))!.form.getRawValue();
    const studyForm = this.panels.find(p => p.name === 'انتخاب رشته')!.form.getRawValue();

    const finalPersonal = {
      name: personalForm.name || this.prefilledUserData.name || 'نامشخص',
      family: personalForm.family || this.prefilledUserData.family || 'نامشخص',
      nationalCode: personalForm.nationalCode,
      shenasnameSerial: personalForm.shenasnameSerial || this.prefilledUserData.shenasnameSerial,
      jalaliBirthDate: personalForm.jalaliBirthDate,
      mobilePhone: personalForm.mobilePhone,
      email: personalForm.email,
      phoneHome: personalForm.phoneHome,
      importPhone: personalForm.importPhone,
      hand: personalForm.hand,
      married: personalForm.married,
      job: personalForm.job || 'نامشخص',
      province: personalForm.province,
      city: personalForm.city,
      getKnow: personalForm.getKnow
    };

    const payload: any = {
      tenantId: this.tenantId,
      periodId: this.periodId,
      serialCode: this.serialCode,

      name: finalPersonal.name,
      family: finalPersonal.family,
      address: personalForm.address,
      foreign: personalForm.nationality,

      nationalCode: finalPersonal.nationalCode,
      birthCertificateNumber: finalPersonal.shenasnameSerial || 'ندارد',
      birthDate: this.convertJalaliToGregorian(finalPersonal.jalaliBirthDate),

      cellphone: finalPersonal.mobilePhone,
      email: finalPersonal.email || null,
      phone: finalPersonal.phoneHome || null,
      emergencyPhoneNumber: finalPersonal.importPhone,

      isLeftHanded: finalPersonal.hand === 'هستم',
      isMarried: finalPersonal.married === 'متاهل',
      job: finalPersonal.job,

      provinceId: finalPersonal.province,
      cityId: finalPersonal.city,
      educationMethod: 1,
      status: 1,
      description: 'string',
      confidentialDescription: 'string',
      civilRegistryInquiryStatus: 1,
      medicalHistory: 'string',
      hasNoExpulsionRecord: 1,
      evaluatorNote: 'string',
      examSeatNumber: 0,
      examScore: 0,
      rawExamScore: 0,
      academicScore: 0,
      interviewScore: 0,

      howMetUs: this.mapHowMetUs(finalPersonal.getKnow),

      schoolFieldId: studyForm.schoolStudy,
      examSchoolId: this.mapCenterExam(studyForm.centerExam),

      selectedScores: this.getSelectedWithFiles(this.ScoreItems, 'scores'),
      selectedExemptions: this.getSelectedWithFiles(this.exemptionItems, 'exemptions'),

      educationHistories: this.educationHistory.length > 0
        ? this.educationHistory.map((edu: any) => ({
          tenantId: this.tenantId,
          periodId: this.periodId,
          applicantId: 0,
          educationDegree: edu.sectionTitle || 2,
          gpa: edu.gpa || 0,
          graduationYear: edu.endYear || 0,
          isComplete: true,
          isSeminary: edu.isSeminary || false,
          universityName: edu.universityName || null,
          fieldOfStudyName: edu.fieldTitle || null
        }))
        : [],

      examResults: []
    };

    console.log('Payload نهایی (با getRawValue):', payload);

    this.enterInformationService.registerUser(payload).subscribe({
      next: (res) => {
        this.createMessage('success', 'ثبت‌ نام با موفقیت انجام شد!');
        this.printDataService.updateUserInfo({
          name: payload.name,
          family: payload.family,
          nationalCode: payload.nationalCode,
          phoneNumber: payload.cellphone,
          email: payload.email
        });
        this.nextStep();
      },
      error: (err) => {
        console.error('خطا در ثبت‌ نام:', err);
        this.createMessage('error', 'خطایی رخ داد. لطفاً دوباره تلاش کنید.');
      }
    });
  }

  onScoreFileUpload(fieldControlName: string, scoreId: number, fileList: FileList) {
    if (!fileList?.length) return;

    const file = fileList[0];
    const controlPath = `score_${scoreId}`;

    this.minioService.setLoading(controlPath, true);

    this.minioService.upload([file], 'scores').subscribe({
      next: (response: any) => {
        const uploaded = response?.result?.[0];
        const url = uploaded?.url;

        if (url) {
          if (!this.scoreFilesForm.contains(controlPath)) {
            this.scoreFilesForm.addControl(controlPath,
              this.fb.control({name: file.name, url})
            );
          } else {
            this.scoreFilesForm.get(controlPath)?.setValue({name: file.name, url});
          }

          this.updateAllCheckboxGroupValidations();
        }
      },
      error: (err: any) => {
        console.error('خطا در آپلود فایل امتیاز', err);
        this.createMessage('error', 'خطا در آپلود فایل');
      },
      complete: () => {
        this.minioService.setLoading(controlPath, false);
      }
    });
  }

  handleScoreFileRemove(scoreId: number) {
    const controlPath = `score_${scoreId}`;
    const fileData = this.scoreFilesForm.get(controlPath)?.value;

    if (fileData?.url) {
      this.minioService.deleteFiles([fileData.url]).subscribe({
        next: () => {
          this.scoreFilesForm.removeControl(controlPath);
          this.updateAllCheckboxGroupValidations();
        },
        error: (err: any) => {
          console.error('خطا در حذف فایل', err);
        }
      });
    } else {
      this.scoreFilesForm.removeControl(controlPath);
      this.updateAllCheckboxGroupValidations();
    }
  }

  onExemptionFileUpload(fieldControlName: string, exemptionId: number, fileList: FileList) {
    if (!fileList?.length) return;

    const file = fileList[0];
    const controlPath = `exemption_${exemptionId}`;

    this.minioService.setLoading(controlPath, true);

    this.minioService.upload([file], 'exemptions').subscribe({
      next: (response: any) => {
        const uploaded = response?.result?.[0];
        const url = uploaded?.url;

        if (url) {
          if (!this.exemptionFilesForm.contains(controlPath)) {
            this.exemptionFilesForm.addControl(controlPath,
              this.fb.control({name: file.name, url})
            );
          } else {
            this.exemptionFilesForm.get(controlPath)?.setValue({name: file.name, url});
          }

          this.updateAllCheckboxGroupValidations();
        }
      },
      error: (err: any) => {
        console.error('خطا در آپلود فایل معافیت', err);
        this.createMessage('error', 'خطا در آپلود فایل');
      },
      complete: () => {
        this.minioService.setLoading(controlPath, false);
      }
    });
  }

  handleExemptionFileRemove(exemptionId: number) {
    const controlPath = `exemption_${exemptionId}`;
    const fileData = this.exemptionFilesForm.get(controlPath)?.value;

    if (fileData?.url) {
      this.minioService.deleteFiles([fileData.url]).subscribe({
        next: () => {
          this.exemptionFilesForm.removeControl(controlPath);
          this.updateAllCheckboxGroupValidations();
        },
        error: (err: any) => {
          console.error('خطا در حذف فایل', err);
        }
      });
    } else {
      this.exemptionFilesForm.removeControl(controlPath);
      this.updateAllCheckboxGroupValidations();
    }
  }

  private getSelectedWithFiles(items: any[], type: 'scores' | 'exemptions'): any[] {
    const panelName = type === 'scores' ? 'امتیاز ها' : 'معافیت ها';
    const panel = this.panels.find(p => p.name === panelName);
    if (!panel) return [];

    const formArray = panel.form.get(type) as FormArray;
    if (!formArray) return [];

    const filesForm = type === 'scores' ? this.scoreFilesForm : this.exemptionFilesForm;

    return items
      .map((item, index) => {
        if (formArray.at(index)?.value === true) {
          const fileKey = type === 'scores' ? `score_${item.id}` : `exemption_${item.id}`;
          const fileData = filesForm.get(fileKey)?.value;

          return {
            applicantId: 0,
            [type === 'scores' ? 'scoreCriteriaId' : 'exemptionId']: item.id,
            status: 1,
            files: fileData ? [{name: fileData.name, url: fileData.url}] : []
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  fileRequiredIfCheckedValidatorOld(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return null;
    };
  }
}
