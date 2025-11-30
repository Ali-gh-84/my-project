import {
  Component,
  ElementRef,
  EventEmitter,
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
import {JalaliDatePickerComponent} from '../../../share/components/jalali-date-picker/jalali-date-picker.component';
import {PrintDataService} from '../print-data/print-data.service';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {CityCountry, dataKeep} from './enter-information-model';
import {EnterInformationService} from './enter-information.service';
import {combineLatest, finalize, forkJoin, of, race, take, throwError, timeout, timer} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {NzTableComponent} from 'ng-zorro-antd/table';

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
    NzTableComponent
  ],
  templateUrl: './enter-information.component.html',
  styleUrl: './enter-information.component.css'
})
export class EnterInformationComponent {

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

  @ViewChildren('fileInput') set fileInputs(inputs: QueryList<ElementRef>) {
    inputs.forEach(input => {
    });
  }

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private nzConfig: NzConfigService,
    private enterInformationService: EnterInformationService,
    private printDataService: PrintDataService) {
    this.nzConfig.set('message', {nzTop: 80});
  }

  panels: any[] = [];
  private provinceOptions: any[] = [];
  private cityOptions: any[] = [];
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
    this.buildPanels();
    this.loadExemptionsAndPrefill();
    this.loadScoreAndPrefill()
    this.loadingPanels = this.panels.map(() => false);
    this.initUploadFileForm();
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

  onSelectChange(controlName: string, value: any) {
    if (controlName.includes('province') ||
      controlName === 'country' ||
      controlName === 'provinceSchool' ||
      controlName === 'provinceTest') {
      this.onProvinceChange(value);
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
          province: ['', Validators.required],
          city: ['', Validators.required],
          getKnow: ['', Validators.required],
        }),
        fields: [
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
      // 3. تحصیلات غیر حوزوی
      {
        name: 'تحصیلات غیر حوزوی',
        active: false,
        showEducationHistory: true,
        form: this.fb.group({
          statusDegree: [''],
          diplomaCourse: [''],
          average: [],
          endSemester: [],
          typeCourse: [''],
          provinceSchool: [''],
          citySchool: [''],
          school: [''],
          typePresence: [''],
          provinceTest: [''],
          cityTest: [''],
          centerTest: [''],
        }),
        fields: [
          {
            controlName: 'statusDegree', label: 'وضعیت تحصیلی', type: 'select', required: false, options: [
              {value: 'اتمام', label: 'اتمام'},
              {value: 'اشتغال', label: 'اشتغال'}
            ]
          },
          {
            controlName: 'diplomaCourse', label: 'رشته دیپلم', type: 'select', required: false, options: [
              {value: 'ریاضی', label: 'ریاضی'},
              {value: 'تجربی', label: 'تجربی'},
              {value: 'انسانی', label: 'انسانی'}
            ]
          },
          {controlName: 'average', label: 'معدل کل', type: 'number', required: false, min: 0, max: 20},
          {
            controlName: 'endSemester',
            label: 'سال فارغ التحصیلی',
            type: 'number',
            required: false,
            min: 1300,
            max: 1404
          },
          {
            controlName: 'typeCourse', label: 'نوع دوره', type: 'select', required: false, options: [
              {value: 'دیپلم تمام وقت', label: 'دیپلم تمام وقت'}
            ]
          },
          {
            controlName: 'provinceSchool',
            label: 'استان',
            type: 'select',
            required: false,
            options: () => this.provinceOptions.map(c => ({value: c.id, label: c.name}))
          },
          {
            controlName: 'citySchool',
            label: 'شهر',
            type: 'select',
            required: false,
            options: () => this.cityOptions.map(c => ({value: c.id, label: c.name}))
          },
          {
            controlName: 'school', label: 'مدرسه', type: 'select', required: false, options: [
              {value: 'فاطمیه', label: 'فاطمیه'}
            ]
          },
          {
            controlName: 'typePresence', label: 'نوع حضور', type: 'select', required: false, options: [
              {value: 'خوابگاهی', label: 'خوابگاهی'},
              {value: 'روزانه', label: 'روزانه'}
            ]
          },
          {
            controlName: 'provinceTest',
            label: 'استان',
            type: 'select',
            required: false,
            options: () => this.provinceOptions.map(c => ({value: c.id, label: c.name}))
          },
          {
            controlName: 'cityTest',
            label: 'شهر',
            type: 'select',
            required: false,
            options: () => this.cityOptions.map(c => ({value: c.id, label: c.name}))
          },
          {
            controlName: 'centerTest', label: 'مرکز آزمون', type: 'select', required: false, options: [
              {value: 'فاطمیه', label: 'فاطمیه'}
            ]
          }
        ],
        // extraTexts: [
        //   {text: 'دوره 5 ساله(ویژه دارندگان مدرک دیپلم و بالاتر)', after: 'graduationYear'},
        //   {text: 'مدرسه انتخابی (نزدیکترین مدرسه به محل سکونت)', after: 'typeCourse'},
        //   {text: 'مرکز آزمون', after: 'typePresence'}
        // ]
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
            hint: 'داوطلب گرامی: در صورت داشتن امتیازات ویژه، مدارک مربوطه را در زمان مصاحبه به مدرسه علمیه انتخابی خود تحویل دهید.',
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
            hint: 'در صورت داشتن معافیت، مدارک مربوطه را در زمان مصاحبه ارائه دهید.',
          }
        ]
      }
    ];
  }

  fileRequiredIfCheckedValidator(uploadForm: FormGroup): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormArray)) return null;
      const formArray = control as FormArray;
      let items: { id: number }[] = [];
      let isExemptionPanel = false;
      const parentForm = formArray.parent as FormGroup;
      if (parentForm) {
        const scorePanel = this.panels.find(p => p.name === 'امتیاز ها' && p.form === parentForm);
        const exemptionPanel = this.panels.find(p => p.name === 'معافیت ها' && p.form === parentForm);
        if (scorePanel) {
          items = this.ScoreItems;
        } else if (exemptionPanel) {
          items = this.exemptionItems;
          isExemptionPanel = true;
        }
      }
      if (items.length === 0) {
        const controlName = Object.keys(parentForm?.controls || {}).find(key => parentForm?.get(key) === formArray);
        if (controlName === 'scores') items = this.ScoreItems;
        if (controlName === 'exemptions') items = this.exemptionItems;
      }
      for (let i = 0; i < formArray.length; i++) {
        if (formArray.at(i).value === true) {
          const itemId = items[i]?.id;
          if (itemId != null) {
            const fileControl = uploadForm.get(`file_${itemId}`);
            if (!fileControl?.value) {
              return {fileRequired: {message: 'آپلود مدرک الزامی است'}};
            }
          }
        }
      }
      return null;
    };
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
          formArray.updateValueAndValidity();
          panel.form.updateValueAndValidity();
        }
      }
    });
  }

  initUploadFileForm() {
    this.uploadFileForm = new FormGroup({});
    this.ScoreItems.forEach(item => {
      this.uploadFileForm.addControl(`score_${item.id}`, this.fb.control(null));
    });
    this.exemptionItems.forEach(item => {
      this.uploadFileForm.addControl(`exemption_${item.id}`, this.fb.control(null));
    });
  }

  openFileInput(id: string) {
    const el = document.getElementById(id) as HTMLInputElement;
    el?.click();
  }

  isCheckboxChecked(form: FormGroup, arrayName: string, index: number): boolean {
    const array = form.get(arrayName) as FormArray;
    return array?.at(index)?.value === true;
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

          const fileControlName = `file_${item.id}`;
          if (!this.uploadFileForm.contains(fileControlName)) {
            this.uploadFileForm.addControl(fileControlName, this.fb.control(null));
          }
        });

        const field = scorePanel.fields[0];
        field.options = () => items.map(item => ({label: item.name, value: item.id}));

        scoresArray.setValidators(this.fileRequiredIfCheckedValidator(this.uploadFileForm));
        scoresArray.updateValueAndValidity();
      },
      error: (err) => {
        console.error('خطا در بارگذاری امتیاز ها', err);
        this.createMessage('error', 'خطا در بارگذاری امتیاز ها');
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

          const fileControlName = `file_${item.id}`;
          if (!this.uploadFileForm.contains(fileControlName)) {
            this.uploadFileForm.addControl(fileControlName, this.fb.control(null));
          }
        });

        const field = exemptionPanel.fields[0];
        field.options = () => items.map(item => ({label: item.name, value: item.id}));

        exemptionsArray.setValidators(this.fileRequiredIfCheckedValidator(this.uploadFileForm));
        exemptionsArray.updateValueAndValidity();
      },
      error: (err) => {
        console.error('خطا در بارگذاری معافیت‌ها', err);
        this.createMessage('error', 'خطا در بارگذاری معافیت‌ها');
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
    if (userData.fatherName) patchData.fatherName = userData.fatherName;
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

  goNext(i: number) {
    const currentPanel = this.panels[i];
    const fillablePanels = ['اطلاعات فردی', 'تحصیلات غیر حوزوی'];

    if (currentPanel.name !== 'دریافت اطلاعات کاربر') {
      if (currentPanel.form.valid) {
        this.activateNextPanel(i);
      } else {
        this.createMessage('error', 'لطفاً فیلدهای ستاره‌دار را تکمیل کنید.');
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
        console.warn('Winner:', winner);
        this.activateNextPanel(i);
        if (winner === 'timeout') {
        }
      });

    api$.subscribe({
      next: ([personal, education]) => {
        const userData = personal?.result || {};
        const eduData = Array.isArray(education?.result) ? education.result : [];

        // نگهداری تمام سابقه تحصیلی در پراپرتی جدید
        this.educationHistory = eduData;

        const lastEdu = eduData.length > 0 ? eduData[eduData.length - 1] : null;

        const fullData = {
          ...userInfoKeeper,
          ...userData,
          lastEdu
        };
        this.fillNextPanelWithUserData(i + 1, fullData);
        this.fillNextPanelWithUserData(i + 3, fullData);
        if (Object.keys(userData).length > 0 || eduData.length > 0) {
          this.disablePrefilledControls();
        }
        this.editing = false;
        this.loadingPanels[i] = false;
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


    const filesToUpload: { [key: string]: File } = {};
    Object.keys(this.uploadFileForm.value).forEach(key => {
      if (this.uploadFileForm.get(key)?.value) {
        filesToUpload[key] = this.uploadFileForm.get(key)?.value;
      }
    });

    console.log('فایل‌های انتخاب شده:', filesToUpload);

    console.log('data is : ', mergedData)
    this.printDataService.updateUserInfo(printInfo);
    this.nextStep();
  }
}
