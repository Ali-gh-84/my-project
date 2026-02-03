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
  ReactiveFormsModule, ValidationErrors, ValidatorFn,
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
import {isValidNationalCode, isValidPhoneNumber} from '../../../share/helpers/help';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {JalaliDatePickerComponent} from '../../../share/components/jalali-date-picker/jalali-date-picker.component';
import {PrintDataService} from '../print-data/print-data.service';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {
  dataKeep,
} from './enter-information-model';
import {EnterInformationService} from './enter-information.service';
import {
  combineLatest,
  of,
  race,
  shareReplay, Subscription,
  take,
  timer
} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {NzTableComponent} from 'ng-zorro-antd/table';
import {MainPageService} from '../../mainpagecomponent/main-page.service';
import moment from 'moment-jalaali';
import {FileUploaderComponent} from '../../../share/components/file-uploader/file-uploader.component';
import {MinioService} from '../../../core/services/minio.service';
import {RegisterSerialService} from '../register-serial/register-serial.service';
import {GeneralService} from '../../../core/services/general.service';

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
  periodId: number | null = null;
  scoreFilesForm = this.fb.group({});
  exemptionFilesForm = this.fb.group({});
  educationFilesForm = this.fb.group({});
  educationDegreeTypeList: any[] = [];
  diplomaDegree: any[] = [];
  structureOption: any[] = [];
  dataFromEhraz: any = {};
  private educationDegreeSub?: Subscription;

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
    private generalService: GeneralService,
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
  private id!: number;
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
    const per = localStorage.getItem('period_id');
    this.periodId = per ? parseInt(per, 10) : null;
    console.log('period id : ', this.periodId);

    this.loadProvinces();
    this.registerSerialService.serialCode$.subscribe(
      (serial) => {
        this.serialCode = serial;
        console.log('Serial code:', serial);
      }
    );

    this.mainPageService.currentTenant$.subscribe(tenantData => {
      if (tenantData) {
        this.tenantId = tenantData.tenantId;
        this.tenantSection = tenantData.section;
        this.theme = tenantData.theme;
        console.log('Theme loaded from service:', this.theme);
        return;
      }
    });

    const stored = this.mainPageService.getCurrentTenantFromStorage();
    if (stored) {
      this.tenantId = stored.tenantId;
      this.tenantSection = stored.section;
      this.theme = stored.theme;

      this.mainPageService.setCurrentTenant(stored.tenantId, stored.section);
    } else {
      this.router.navigate(['/']);
    }

    this.scoreFilesForm = this.fb.group({});
    this.exemptionFilesForm = this.fb.group({});
    this.buildPanels();
    this.loadingPanels = this.panels.map(() => false);
    this.loadScoreAndPrefill();
    this.loadExemptionsAndPrefill();
    this.loadFields();
    this.applyTheme();
    this.getDataFromEhraz();
    this.patchDataFromEhraz();
    this.userDataEducation();
    const birthDateControl = this.getPersonalPanelForm()?.get('jalaliBirthDate');

    if (birthDateControl) {
      birthDateControl.valueChanges.subscribe((newValue: any) => {
        if (newValue) {
          this.userEducationWhenNullBirthDate(newValue);
        }
      });
    }

    this.getEnums();
    console.log('data ehraz from enter info : ', this.dataFromEhraz)
  }

  getDataFromEhraz() {
    let data = this.mainPageService.getInformationFromEhrazValue();

    if (!data) {
      const storedData = localStorage.getItem('userRegisteredInEhraz');
      if (storedData) {
        try {
          data = JSON.parse(storedData);
        } catch (e) {
          console.error('Error parsing local storage data', e);
          data = null;
        }
      }
    }
    this.dataFromEhraz = data;
  }

  private getPersonalPanelForm() {
    const panel = this.panels.find(p => p.name === 'اطلاعات فردی');
    return panel?.form;
  }

  patchDataFromEhraz() {
    const form = this.getPersonalPanelForm();
    if (form) {
      const mappedData = {
        name: this.dataFromEhraz.firstName,
        family: this.dataFromEhraz.lastName,
        nationalCode: this.dataFromEhraz.nationalCode,
        mobilePhone: this.dataFromEhraz.mobile,
        jalaliBirthDate: this.convertJalaliToGregorian(this.dataFromEhraz.jalaliBirthDate),
        gender: this.dataFromEhraz.gender,
      };
      form.patchValue(mappedData);

      Object.keys(form.controls).forEach(key => {
        const control = form.get(key);

        if (control && control.value !== null && control.value !== undefined && control.value !== '') {
          control.disable();
        } else {
          control.enable();
        }
      });
    }
  }

  userDataEducation() {
    const form = this.getPersonalPanelForm().get('jalaliBirthDate').value;

    if (form !== null) {
      this.enterInformationService.getDataUserEducations(form).subscribe(
        res => {
          this.educationHistory = res.result;
        },
          error => {
          this.createMessage(error, error.error.message);
          })
    } else {
      // this.userEducationWhenNotNullBirthDate();
      console.log('education data not found')
    }
  }

  userEducationWhenNullBirthDate(birthDate: string) {
    this.enterInformationService.getDataUserEducations(birthDate).subscribe(
      (res) => {
        this.educationHistory = res.result;
        console.log('Education history updated based on user input.');
      },
      (error) => {
        console.error('Error fetching education:', error);
      }
    );
  }

  applyTheme() {
    const root = document.documentElement;

    root.style.setProperty('--collapse-header-bg', this.theme.header);
    root.style.setProperty('--collapse-content-bg', this.theme.overlay);
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
        this.createMessage('error', err.error.message);
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
        this.createMessage('error', err.error.message);
      }
    });
  }

  loadSchool() {
    const personalForm = this.getPersonalPanelForm();
    // const personalForm = this.panels[1]?.form;
    const studyForm = this.panels.find(p => p.name === 'انتخاب رشته')?.form;

    if (!personalForm || !studyForm) return;

    const provinceId = personalForm.get('province')?.value;
    const fieldId = studyForm.get('study')?.value;
    const subFieldId = studyForm.get('subStudy')?.value;
    const nationalCode = personalForm.get('nationalCode')?.value;

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

    this.enterInformationService.getAllSchool(provinceName, this.tenantId, fieldId, subFieldId, nationalCode).subscribe({
      next: (school: any[]) => {
        this.schoolOptions = school;
        console.log('مدارس لود شد:', school);
      },
      error: (err) => {
        console.error('خطا در بارگذاری مدارس', err);
        this.createMessage('error', err.error.message);
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
      this.loadSchool();
      // console.log('load school **')
      this.onFieldChange(value);
    } else if (controlName === 'subStudy') {
      this.loadSchool();
    } else if (controlName === 'isSeminary') {
      // this.getEnums();
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
        this.createMessage('error', err.error.message);
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
        this.createMessage('error', err.error.message);
      }
    });
  }

  private buildPanels() {
    this.panels = [
      // اعتبار سنجی کاربر
      // {
      //   name: 'دریافت اطلاعات کاربر',
      //   active: true,
      //   form: this.fb.group({
      //     nationalCode: ['', [Validators.required, isValidNationalCode]],
      //     jalaliBirthDate: ['', Validators.required],
      //   }),
      //   fields: [
      //     {controlName: 'nationalCode', label: 'کد ملی', type: 'text', required: true},
      //     {controlName: 'jalaliBirthDate', label: 'تاریخ تولد', type: 'date', required: true},
      //   ]
      // },
      // 1. اطلاعات فردی
      {
        name: 'اطلاعات فردی',
        active: true,
        form: this.fb.group({
          tenantId: this.tenantId,
          periodId: this.periodId,
          // firstName: ['', Validators.required],
          // lastName: ['', Validators.required],
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
          // mobile: ['', [Validators.required, isValidPhoneNumber]],
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
          educationDegree: ['', Validators.required],
          average: [Validators.required],
          endSemester: [Validators.required],
          isSeminary: [Validators.required],
          educationGrid: this.fb.array([Validators.required]),
        }),
        fields: [
          {
            controlName: 'isSeminary', label: 'تحصیلات حوزوی', type: 'select', required: true, options: [
              {value: true, label: 'حوزوی'},
              {value: false, label: 'غیر حوزوی'},
            ]
          },
          {
            controlName: 'educationDegree', label: 'مدرک تحصیلی', type: 'select', required: true,
            options: () => this.educationDegreeTypeList.map(f => ({value: f.value, label: f.description}))
          },
          {controlName: 'average', label: 'معدل', type: 'number', required: true, min: 0, max: 20},
          {
            controlName: 'endSemester',
            label: 'سال فارغ التحصیلی',
            type: 'number',
            required: true,
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
          schoolStudy: ['', Validators.required],
          centerExam: ['', [Validators.required]],
          structureStudy: ['', Validators.required],
        }),
        fields: [
          {
            controlName: 'structureStudy',
            label: 'شیوه آموزش',
            type: 'select',
            required: true,
            options: () => this.structureOption.map(f => ({value: f.value, label: f.description}))
          },
          {
            controlName: 'study',
            label: 'رشته',
            type: 'select',
            required: true,
            options: () => this.fieldOptions.map(f => ({value: f.id, label: f.name}))
          },
          {
            controlName: 'subStudy',
            label: 'گرایش',
            type: 'select',
            required: true,
            options: () => this.subFieldOptions.map(s => ({value: s.id, label: s.name}))
          },
          {
            controlName: 'schoolStudy',
            label: 'مدرسه',
            type: 'select',
            required: true,
            options: () => this.schoolOptions.map(s => ({value: s.id, label: s.school.name})) // s.school.name
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
        active: false,
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
        active: false,
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

    const form = eduPanel.form;

    const hasHistory = this.educationHistory?.length > 0;

    if (this.tenantId === 4) {
      this.educationDegreeSub?.unsubscribe();
      this.educationDegreeSub =
        form.get('educationDegree')?.valueChanges.subscribe((value: number) => {
          this.handleEducationDegreeChange(value, eduPanel, form);
        });

      const existingFields = eduPanel.fields.map((f: any) => f.controlName);

      if (!existingFields.includes('statusStudy')) {
        eduPanel.fields.push({
          controlName: 'statusStudy',
          label: 'وضعیت تحصیلی',
          type: 'select',
          required: true,
          options: [
            {value: 0, label: 'اشتغال'},
            {value: 1, label: 'اتمام'},
          ]
        });

        form.addControl('statusStudy', this.fb.control('', Validators.required));

        form.get('statusStudy')!.valueChanges.subscribe((value: number) =>
          this.handleStatusChange(value, eduPanel, form)
        );
      }
    }

    eduPanel.showEducationHistory = hasHistory;
    hasHistory ? form.disable() : form.enable();
  }

  private handleStatusChange(value: number, eduPanel: any, form: FormGroup) {
    ['grade10', 'grade11', 'average', 'endYear'].forEach(ctrl => {
      if (form.contains(ctrl)) {
        form.removeControl(ctrl);
      }
      eduPanel.fields = eduPanel.fields.filter((f: any) => f.controlName !== ctrl);
    });

    if (value === 0) { // اشتغال
      eduPanel.fields.push(
        {controlName: 'grade10', label: 'معدل دهم', type: 'number', required: true, min: 0, max: 20},
        {controlName: 'grade11', label: 'معدل یازدهم', type: 'number', required: true, min: 0, max: 20}
      );
      form.addControl('grade10', this.fb.control('', [Validators.required, Validators.min(0), Validators.max(20)]));
      form.addControl('grade11', this.fb.control('', [Validators.required, Validators.min(0), Validators.max(20)]));
    } else if (value === 1) { // اتمام
      eduPanel.fields.push(
        {controlName: 'average', label: 'معدل کل', type: 'number', required: true, min: 0, max: 20},
        {controlName: 'endYear', label: 'سال اتمام', type: 'number', required: true, min: 1300, max: 1404}
      );
      form.addControl('average', this.fb.control('', [Validators.required, Validators.min(0), Validators.max(20)]));
      form.addControl('endYear', this.fb.control('', [Validators.required, Validators.min(1300), Validators.max(1404)]));
    }
  }

  private handleEducationDegreeChange(
    value: number,
    eduPanel: any,
    form: FormGroup
  ) {
    if (form.contains('diplomaDegree')) {
      form.removeControl('diplomaDegree');
    }

    eduPanel.fields = eduPanel.fields.filter(
      (f: any) => f.controlName !== 'diplomaDegree'
    );

    if (value === 1) {
      eduPanel.fields.push({
        controlName: 'diplomaDegree',
        label: 'مدرک دیپلم',
        type: 'select',
        required: true,
        options: () =>
          this.diplomaDegree.map((f: any) => ({
            value: f.value,
            label: f.description
          }))
      });

      form.addControl(
        'diplomaDegree',
        this.fb.control('', Validators.required)
      );
    }
  }

  private updateAllCheckboxGroupValidations() {
    this.panels.forEach(panel => {
      if (panel.name === 'امتیاز ها' || panel.name === 'معافیت ها') {

        const isScore = panel.name === 'امتیاز ها';
        const arrayName = isScore ? 'scores' : 'exemptions';
        const formArray = panel.form.get(arrayName) as FormArray;

        if (!formArray) return;

        const validator = isScore
          ? this.fileRequiredIfCheckedValidator(this.scoreFilesForm, 'scores')
          : this.fileRequiredIfCheckedValidator(this.exemptionFilesForm, 'exemptions');

        formArray.setValidators(validator);
        formArray.updateValueAndValidity({emitEvent: false});
        panel.form.updateValueAndValidity({emitEvent: false});
      }
    });
  }

  fileRequiredValidator(filesForm: FormGroup, controlName: string): ValidatorFn {
    return (): ValidationErrors | null => {
      const file = filesForm.get(controlName)?.value;
      return file ? null : {fileRequired: true};
    };
  }

  fileRequiredIfCheckedValidator(
    filesForm: FormGroup,
    arrayName: 'scores' | 'exemptions'
  ): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormArray)) return null;

      const hasError = control.controls.some((ctrl, index) => {
        if (ctrl.value === true) {
          const fileKey = `${arrayName.slice(0, -1)}_${index + 1}`;
          const file = filesForm.get(fileKey)?.value;
          return !file;
        }
        return false;
      });

      return hasError ? {fileRequired: true} : null;
    };
  }

  handleEducationFileRemove() {
    const controlPath = 'education_file';
    const fileData = this.educationFilesForm.get(controlPath)?.value;

    if (fileData) {
      this.minioService.deleteFiles([fileData]).subscribe({
        next: () => this.educationFilesForm.removeControl(controlPath),
        error: err => console.error(err.error.message)
      });
    } else {
      this.educationFilesForm.removeControl(controlPath);
    }
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
          scoresArray.push(
            this.fb.control(false, {nonNullable: true})
          );
        });

        scoresArray.updateValueAndValidity();

        scorePanel.form.updateValueAndValidity();
      },
      error: (err: any) => {
        console.error('خطا در بارگذاری امتیاز ها', err);
        this.createMessage('error', err.error.message);
      }
    });
  }


  loadExemptionsAndPrefill() {
    this.enterInformationService.getAllExemption(this.para).subscribe({
      next: (items: any[]) => {
        this.exemptionItems = items;

        const exemptionPanel = this.panels.find(p => p.name === 'معافیت ها');
        if (!exemptionPanel) return;

        const exemptionsArray = exemptionPanel.form.get('exemptions') as FormArray;
        exemptionsArray.clear();

        items.forEach(item => {
          exemptionsArray.push(this.fb.control(false));
        });

        // exemptionsArray.setValidators(this.fileRequiredIfCheckedValidator(this.exemptionFilesForm, 'exemptions'));
        exemptionsArray.updateValueAndValidity();

        exemptionPanel.form.updateValueAndValidity();
      },
      error: (err: any) => {
        console.error('خطا در بارگذاری معافیت ها', err.error.message);
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

  fillNextPanelWithUserData(nextIndex: number, userData: any, userInputFromPanel1?: { nationalCode: string, jalaliBirthDate: string }) {
    const nextPanel = this.panels[nextIndex];
    const patchData: any = {};

    if (userData.firstName) patchData.name = userData.firstName;
    if (userData.lastName) patchData.family = userData.lastName;
    // if (userData.fatherName) patchData.fatherName = userData.fatherName;
    if (userData.mobile) patchData.mobilePhone = userData.mobile;
    if (userData.sex) patchData.sex = userData.sex;
    if (userData.marriageStatusTitle) patchData.married = userData.marriageStatusTitle;
    if (userData.nationalityTitle) patchData.nationality = userData.nationalityTitle;
    if (userData.idNumber) patchData.shenasnameSerial = userData.idNumber;

    if (userInputFromPanel1) {
      patchData.nationalCode = userInputFromPanel1.nationalCode;
      patchData.jalaliBirthDate = userInputFromPanel1.jalaliBirthDate;
    } else if (userData.nationalCode) {
      patchData.nationalCode = userData.nationalCode;
    } else if (userData.birthDate) {
      patchData.jalaliBirthDate = userData.birthDate;
    }

    if (userData.lastEdu) {
      const edu = userData.lastEdu;
      if (edu.average) patchData.average = edu.average;
      if (edu.endSemester) patchData.endSemester = edu.endSemester;
      console.log("EDU FOUND:", edu);
    }

    nextPanel.form.patchValue(patchData);

    if (userInputFromPanel1) {
      nextPanel.form.get('nationalCode')?.disable({ emitEvent: false });
      nextPanel.form.get('jalaliBirthDate')?.disable({ emitEvent: false });
    }
  }

  goBack(i: number) {
    if (i === 0) return;
    this.panels.forEach((p, idx) => p.active = idx === i - 1);
  }

  goNext(i: number) {
    const currentPanel = this.panels[i];

    if (currentPanel.name === 'سوابق تحصیلی') {
      const hasHistory = this.educationHistory?.length > 0;
      const formIsValid = currentPanel.form.valid;

      if (!hasHistory && !formIsValid) {
        this.createMessage('error', 'لطفاً اطلاعات سوابق تحصیلی را کامل وارد کنید.');
        return;
      }

      this.activateNextPanel(i);
      return;
    }

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

    const { nationalCode, jalaliBirthDate } = currentPanel.form.value;

    const userInfoKeeper: dataKeep = {
      nationalCode,
      jalaliBirthDate
    };

    this.enterInformationService.updateUserInfo(userInfoKeeper);

    this.loadingPanels[i] = true;

    const api$ = this.enterInformationService
      .getDataUserLocal(nationalCode)
      .pipe(
        catchError(err => {
          console.warn('getDataUserLocal failed, fallback to getDataUser', err);
          return this.enterInformationService.getDataUser(
            nationalCode,
            jalaliBirthDate,
            this.tenantId
          );
        }),
        catchError(err => {
          const msg = err?.error?.message || '';

          if (msg.includes('مردان مجاز به ثبت نام نیستند')) {
            this.createMessage('error', msg);
            this.router.navigate(['/']);
          }

          return of({ result: [] });
        }),
        shareReplay(1)
      );

    const educations$ = this.enterInformationService
      .getDataUserEducations(nationalCode)
      .pipe(
        catchError(() => of({ result: [] }))
      );

    const combined$ = combineLatest([api$, educations$]).pipe(
      shareReplay(1)
    );

    race(
      combined$.pipe(map(() => 'api')),
      timer(7000).pipe(map(() => 'timeout'))
    )
      .pipe(take(1))
      .subscribe(() => {
        this.activateNextPanel(i);
      });

    combined$.subscribe({
      next: ([personal, education]) => {
        const userData = personal?.result?.[0] || {};
        const eduData = Array.isArray(education?.result)
          ? education.result
          : [];

        this.educationHistory = eduData;

        const lastEdu = eduData.length > 0
          ? eduData[eduData.length - 1]
          : null;

        const fullData = {
          ...userInfoKeeper,
          ...userData,
          lastEdu
        };
        console.log('user data is : ', userData)

        this.fillNextPanelWithUserData(i + 1, fullData, {
          nationalCode: currentPanel.form.value.nationalCode,
          jalaliBirthDate: currentPanel.form.value.jalaliBirthDate
        });


        if (Object.keys(fullData).length > 0 || eduData.length > 0) {
          this.disablePrefilledControls();
        }

        this.editing = false;
        this.loadingPanels[i] = false;

        this.adjustEducationPanelForTenant();
      },
      error: err => {
        console.error(err);
        this.createMessage('error', err.message);
        this.loadingPanels[i] = false;
      }
    });
  }

  disablePrefilledControls() {
    const personalPanel = this.panels.find(p => p.name === 'اطلاعات فردی');

    if (personalPanel?.form) {
      personalPanel.form.get('nationalCode')?.disable({ emitEvent: false });
      personalPanel.form.get('jalaliBirthDate')?.disable({ emitEvent: false });
    }

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
      // console.error(err.message);
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

    const eduPanel = this.panels.find(p => p.name === 'سوابق تحصیلی');
    const eduFormValue = eduPanel?.form.getRawValue();
    const personalForm = this.panels.find(p => p.name.includes('اطلاعات فردی'))!.form.getRawValue();
    const studyForm = this.panels.find(p => p.name === 'انتخاب رشته')!.form.getRawValue();
    let civil = 1;
    if (personalForm) {
      civil = 3;
    }

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

    let educationHistories: any[] = [];

    if (this.educationHistory.length > 0) {
      educationHistories = this.educationHistory.map((edu: any) => ({
        tenantId: this.tenantId,
        periodId: this.periodId,
        applicantId: 0,
        gpa: edu.average || 0,
        graduationYear: edu.endYear || 0,
        isComplete: edu.hasCertificate,
        universityName: edu.universityName || "",
        fieldOfStudyName: edu.fieldTitle || "",
        subFieldOfStudyName: edu.subFieldOfStudyName || "",
        isSeminary: edu.isSeminary ?? true,
        section: edu.sectionId - 1,
        educationDegree: edu.structureStudy?.value || 0,
        diplomaDegree: edu.diplomaDegree?.value || 0,
      }));
    }
    else if (eduPanel && eduPanel.form.valid) {
      educationHistories = [{
        tenantId: this.tenantId,
        periodId: this.periodId,
        applicantId: 0,
        gpa: eduFormValue.average,
        graduationYear: eduFormValue.endSemester,
        isComplete: true,
        universityName: '',
        fieldOfStudyName: studyForm.study,
        subFieldOfStudyName: studyForm.subStudy,
        isSeminary: eduFormValue.isSeminary,
        section: eduFormValue.educationDegree - 1,
        educationDegree: eduFormValue.educationDegree,
        diplomaDegree: 0,
      }];
    }

    const rawScores = this.getSelectedWithFiles(this.ScoreItems, 'scores');
    const rawExemptions = this.getSelectedWithFiles(this.exemptionItems, 'exemptions');

    const payload: any = {
      tenantId: this.tenantId,
      periodId: this.periodId,

      name: finalPersonal.name,
      family: finalPersonal.family,
      address: personalForm.address,
      foreign: personalForm.nationality,

      nationalCode: finalPersonal.nationalCode,
      birthCertificateNumber: finalPersonal.shenasnameSerial || 'ندارد',
      birthDate: this.convertJalaliToGregorian(finalPersonal.jalaliBirthDate),

      cellphone: finalPersonal.mobilePhone,
      email: finalPersonal.email || "0988888888",
      phone: finalPersonal.phoneHome || "099999999",
      emergencyPhoneNumber: finalPersonal.importPhone,
      trackingCode: this.serialCode,

      isLeftHanded: finalPersonal.hand === 'هستم',
      isMarried: finalPersonal.married === 'متاهل',
      job: finalPersonal.job,

      provinceId: finalPersonal.province,
      cityId: finalPersonal.city,
      educationMethod: 1,
      status: 1,
      description: 'string',
      confidentialDescription: 'string',
      civilRegistryInquiryStatus: civil,
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

      selectedScores: this.dedupeScores(rawScores),
      selectedExemptions: this.dedupeExemptions(rawExemptions),

      educationHistories: educationHistories,

      examResults: [],
      // files: [],
    };

    console.log('Payload نهایی (با getRawValue):', payload);
    this.enterInformationService.setAllInfo(payload);

    this.enterInformationService.registerUser(payload).pipe(take(1)).subscribe({
      next: (res) => {

        const Id = res.result.id;
        const conCurrencyStamp = res.result.concurrencyStamp;
        this.enterInformationService.setUserId(Id);
        payload.id = Id;
        payload.concurrencyStamp = conCurrencyStamp;
        const photoFile = res.result.files?.find((f: any) => f.name === 'تصویر شخصی' || f.type === 'photo');

        // this.createMessage('success', 'ثبت‌ نام با موفقیت انجام شد!');
        this.printDataService.updateUserInfo({
          name: payload.name,
          family: payload.family,
          nationalCode: payload.nationalCode,
          phoneNumber: payload.cellphone,
          email: payload.email,
          photo: photoFile ? photoFile.url : null,
        });
        this.nextStep();
        localStorage.removeItem('userRegisteredInEhraz');
      },
      error: (err) => {
        console.error('خطا در ثبت‌ نام:', err);
        this.createMessage('error', err.error.message);
      }
    });
  }

  private dedupeExemptions(arr: any[]): any[] {
    const map = new Map<number, any>();

    arr.forEach(item => {
      if (!map.has(item.exemptionId)) {
        map.set(item.exemptionId, item);
      }
    });

    return Array.from(map.values());
  }

  private dedupeScores(arr: any[]): any[] {
    const map = new Map<number, any>();

    arr.forEach(item => {
      if (!map.has(item.scoreCriteriaId)) {
        map.set(item.scoreCriteriaId, item);
      }
    });

    return Array.from(map.values());
  }

  onScoreFileUpload(fieldControlName: string, scoreId: number, fileList: FileList) {
    if (!fileList?.length) return;

    const file = fileList[0];
    const controlPath = `score_${scoreId}`;

    this.minioService.setLoading(controlPath, true);

    this.minioService.upload([file], 'register', this.tenantId).subscribe({
      next: (response: any) => {
        const uploaded = response?.result?.[0];
        const url = uploaded?.url;

        if (url) {
          if (!this.scoreFilesForm.contains(controlPath)) {
            this.scoreFilesForm.addControl(controlPath,
              this.fb.control({name: file.name, url})
            );
          } else {
            this.scoreFilesForm.get(controlPath)?.setValue({file});
          }

          this.updateAllCheckboxGroupValidations();
        }
      },
      error: (err: any) => {
        console.error('خطا در آپلود فایل امتیاز', err.message);
        this.createMessage('error', err.error.message);
      },
      complete: () => {
        this.minioService.setLoading(controlPath, false);
      }
    });
  }

  onEducationFileUpload(fileList: FileList) {
    if (!fileList?.length) return;
    const file = fileList[0];
    const controlPath = 'education_file';

    this.minioService.setLoading(controlPath, true);

    this.minioService.upload([file], 'register', this.tenantId).subscribe({
      next: (res: any) => {
        const uploaded = res?.result?.[0];
        const url = uploaded?.url;
        if (url) {
          this.educationFilesForm.setControl(controlPath, this.fb.control({name: file.name, url}));
        }
      },
      error: err => console.error(err.error.message),
      complete: () => this.minioService.setLoading(controlPath, false)
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
          console.error(err.error.message);
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

    this.minioService.upload([file], 'register', this.tenantId).subscribe({
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
        this.createMessage('error', err.error.message);
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
          console.error('خطا در حذف فایل', err.error.message);
        }
      });
    } else {
      this.exemptionFilesForm.removeControl(controlPath);
      this.updateAllCheckboxGroupValidations();
    }
  }

  private getSelectedWithFiles(
    items: any[],
    type: 'scores' | 'exemptions'
  ): any[] {

    const panelName = type === 'scores' ? 'امتیاز ها' : 'معافیت ها';
    const panel = this.panels.find(p => p.name === panelName);
    if (!panel) return [];

    const formArray = panel.form.get(type) as FormArray;
    if (!formArray) return [];

    const filesForm =
      type === 'scores'
        ? this.scoreFilesForm
        : this.exemptionFilesForm;

    const result: any[] = [];

    items.forEach((item, index) => {
      const checked = formArray.controls[index]?.value === true;
      if (!checked) return;

      const fileKey =
        type === 'scores'
          ? `score_${item.id}`
          : `exemption_${item.id}`;

      const fileData = filesForm.get(fileKey)?.value;

      result.push({
        applicantId: 0,
        status: 1,
        ...(type === 'scores'
          ? {scoreCriteriaId: item.id}
          : {exemptionId: item.id}),
        files: fileData
          ? [{
            name: fileData.name,
            url: fileData.url
          }]
          : []
      });
    });

    return result;
  }

  private getEducationPanelForm() {
    const panel = this.panels.find(p => p.name === 'سوابق تحصیلی');
    return panel?.form;
  }

  getEnums() {
    const params = [
      'UniversityDegreeSSOT',
      'SeminaryDegreeSSOT',
      'EducationMethodSSOT',
      'DiplomaDegreeSSOT'
    ];

    const form = this.getEducationPanelForm();
    if (!form) return;

    this.loadEducationDegrees(form.get('isSeminary')?.value, params);

    form.get('isSeminary')!
      .valueChanges
      .subscribe((value: boolean) => {
        this.loadEducationDegrees(value, params);

        form.get('educationDegree')?.reset();
      });
  }

  private loadEducationDegrees(
    isSeminary: boolean,
    params: string[]
  ) {
    this.generalService.GetEnumsDetail(params).subscribe(res => {
      this.structureOption = res[2].items;
      this.diplomaDegree = res[3].items;

      this.educationDegreeTypeList = isSeminary
        ? res[1].items
        : res[0].items;
    });
  }
}
