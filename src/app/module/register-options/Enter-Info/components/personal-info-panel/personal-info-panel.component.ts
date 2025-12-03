// import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormGroup } from '@angular/forms';
// import { NzGridModule } from 'ng-zorro-antd/grid';
// import { NzButtonModule } from 'ng-zorro-antd/button';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
// import {DynamicFormComponent} from '../../share/dynamic-form/dynamic-form.component';
//
// @Component({
//   selector: 'app-personal-info-panel',
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     NzGridModule,
//     NzButtonModule,
//     DynamicFormComponent
//   ],
//   templateUrl: './personal-info-panel.component.html',
//   styleUrl: './personal-info-panel.component.css'
// })
// export class PersonalInfoPanelComponent {
//
//   @Input({ required: true }) form!: FormGroup;
//   @Output() next = new EventEmitter<void>();
//
//
//   provinceOptions = signal<any[]>([]);
//   cityOptions = signal<any[]>([]);
//
//   // این آرایه ثابت و تمیزه — فقط یک بار تعریف میشه
//   fields: FieldConfig[] = [
//     { controlName: 'name', label: 'نام', type: 'text', required: true },
//     { controlName: 'family', label: 'نام خانوادگی', type: 'text', required: true },
//     { controlName: 'address', label: 'آدرس محل سکونت', type: 'text', required: true },
//     { controlName: 'nationality', label: 'تابعیت', type: 'text', required: true, placeholder: 'ایرانی' },
//     { controlName: 'shenasnameSerial', label: 'شماره شناسنامه', type: 'text', required: true },
//     { controlName: 'nationalCode', label: 'کد ملی', type: 'text', required: true },
//     { controlName: 'jalaliBirthDate', label: 'تاریخ تولد', type: 'date', required: true },
//     { controlName: 'job', label: 'شغل', type: 'text', required: true },
//     {
//       controlName: 'married',
//       label: 'وضعیت تاهل',
//       type: 'select',
//       required: true,
//       options: [
//         { label: 'مجرد', value: 'مجرد' },
//         { label: 'متاهل', value: 'متاهل' },
//         { label: 'سایر', value: 'سایر' }
//       ]
//     },
//     { controlName: 'phoneHome', label: 'تلفن ثابت', type: 'tel', required: true },
//     { controlName: 'mobilePhone', label: 'تلفن همراه', type: 'tel', required: true },
//     { controlName: 'email', label: 'پست الکترونیک', type: 'email', required: true },
//     {
//       controlName: 'relegion',
//       label: 'مذهب',
//       type: 'select',
//       required: true,
//       options: [
//         { label: 'شیعه', value: 'شیعه' },
//         { label: 'سنی', value: 'سنی' }
//       ]
//     },
//     {
//       controlName: 'hand',
//       label: 'چپ دست یا راست دست؟',
//       type: 'select',
//       required: true,
//       options: [
//         { label: 'راست دست', value: 'نیستم' },
//         { label: 'چپ دست', value: 'هستم' }
//       ]
//     },
//     { controlName: 'importPhone', label: 'شماره تلفن ضروری', type: 'tel', required: true },
//     {
//       controlName: 'province',
//       label: 'استان',
//       type: 'select',
//       required: true,
//       options: () => this.provinceOptions()
//     },
//     {
//       controlName: 'city',
//       label: 'شهر',
//       type: 'select',
//       required: true,
//       options: () => this.cityOptions()
//     },
//     {
//       controlName: 'getKnow',
//       label: 'نحوه آشنایی با حوزه',
//       type: 'select',
//       required: true,
//       options: [
//         { label: 'از طریق فضای مجازی', value: 'از طریق فضای مجازی' },
//         { label: 'از طریق طلاب حوزه خواهران', value: 'از طریق طلاب حوزه خواهران' },
//         { label: 'از طریق خانواده و دوستان', value: 'از طریق خانواده، دوستان و آشنایان' },
//         { label: 'از طریق رسانه', value: 'از طریق رسانه (تلویزیون، رادیو و...)' },
//         { label: 'از طریق تبلیغات شهری', value: 'از طریق تبلیغات شهری (بنر، پوستر و..)' },
//         { label: 'از طریق ارتباط با حوزه', value: 'از طریق ارتباط با حوزه های علمیه خواهران و بهره مندی از برنامه های آن' }
//       ]
//     }
//   ];
//
//  // private enter
//
//   ngOnInit() {
//     // بارگذاری استان‌ها در ابتدای لود کامپوننت
//     this.loadProvinces();
//
//     // وقتی استان تغییر کرد → شهرها رو بارگذاری کن
//     this.form.get('province')?.valueChanges
//       .pipe(
//         debounceTime(300),
//         distinctUntilChanged(),
//         takeUntilDestroyed()
//       )
//       .subscribe(provinceId => {
//         if (provinceId) {
//           this.loadCities(provinceId);
//         } else {
//           this.cityOptions.set([]);
//         }
//       });
//   }
//
//   private loadProvinces() {
//     const para = { Filter: '', Page: 1, PageCount: 100 };
//     this.service.getAllProvince(para).subscribe({
//       next: (provinces) => this.provinceOptions.set(provinces),
//       error: () => this.provinceOptions.set([])
//     });
//   }
//
//   private loadCities(provinceId: number) {
//     const para = { Filter: '', Page: 1, PageCount: 100 };
//     this.service.getAllCities(para, provinceId).subscribe({
//       next: (cities) => this.cityOptions.set(cities),
//       error: () => this.cityOptions.set([])
//     });
//   }
//
//   onNext() {
//     if (this.form.valid) {
//       this.next.emit();
//     }
//   }
// }
