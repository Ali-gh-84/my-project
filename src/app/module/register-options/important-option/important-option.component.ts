import {Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzButtonModule, NzButtonSize} from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule } from 'ng-zorro-antd/modal';
import {CommonModule} from '@angular/common';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';


@Component({
  selector: 'app-important-option',
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
    NzCheckboxModule
  ],
  standalone: true,
  templateUrl: './important-option.component.html',
  styleUrl: './important-option.component.css'
})
export class ImportantOptionComponent {

  @Output() nextStep = new EventEmitter<void>();
  titlePage: string = 'صفحه ثبت نام يا ويرايش اطلاعات';
  point: string = 'در صورتي كه به هر علتي كد ثبت نام خود را فراموش كرده و يا اقدام به خريد كارت ثبت نام نكرده ايد، مي توانيد از دكمه هاي زير اقدام نماييد.';
  pointForm!: FormGroup;
  size: NzButtonSize  = 'large';
  isVisible = false;

  buttonInfo: any[] = [
    {
      title: 'فهرست مدارس علمیه',
      icon: 'solution'
    },
    {
      title: 'دفترچه راهنما',
      icon: 'file-search'
    },
    {
      title: 'خرید کارت ثبت نام',
      icon: ''
    },
    {
      title: 'پیگیری کارت ثبت نام',
      icon: ''
    },
    {
      title: 'موارد بالا را مطالعه کرده و می پذیرم',
      icon: ''
    },
    {
      title: 'شروع فرآیند',
      icon: ''
    }
  ]

  Data: any[] = [
    {
      title: 'داوطلب عزيز به نكات زير توجه بفرماييد:',
      description:
        '· به هيچ عنوان از كليد back مرورگر استفاده ننماييد.' +
        '· در صورت طولاني شدن بارگذاري صفحه از به روزرساني (refresh) نمودن مرورگر خودداري نماييد.\n' +
        '· اگر با پيام خطا و يا عدم اتصال مواجه شديد، پيشنهاد مي شود ثبت نام را مجددا آغاز نماييد.\n' +
        '. تصاوير اسكن شده(فايل عكس، كارت ملي، صفحات شناسنامه و مدرك تحصيلي و...) با فرمت JPG و حجم حداكثر 1 مگابايت باشد.\n' +
        '. داوطلبان توجه داشته باشند كه جهت دريافت پيامك هاي اطلاع رساني از سوي پذيرش حوزه هاي علميه خواهران بايستي پيامك هاي تبليغاتي شماره همراه ثبت نامي شان فعال باشد.\n' +
        '. داوطلبان بايستي اطلاعات هويتي خود اعم از نام، نام خانوادگي، نام پدر، تاريخ تولد و... را بصورت دقيق و مطابق با اطلاعات كارت ملي خود در فرم ثبت نام وارد كنند؛ در غير اينصورت استعلام هويتي آن ها منفي و از ادامه روند پذيرش باز خواهند ماند.\n' +
        '. طلبه اي كه يكبار به دليل مشروط شدن(محروم از تحصيل-مشروط) بازپذيري شده است، در صورتي كه مجددا به دليل مشروطي از ادامه تحصيل محروم شود؛ مجاز به نام نويسي مجدد در حوزه هاي علميه خواهران نمي باشند.'
    },
    {
      title: 'مدارك و اطلاعات لازم:',
      description: '1. اطلاعات شناسنامه اي شامل محل صدور، شماره شناسنامه، كد ملي و ...؛\n' +
        '2. اطلاعات تحصيلي شامل معدل مقطع تحصيلي و سال فراغت از تحصيل؛\n' +
        '3. آدرس دقيق پستي محل سكونت؛\n' +
        '4. عكس اسكن شده 4×3 جديد، تمام رخ با زمينه سفيد و پوشش كامل اسلامي؛\n' +
        '5. فايل تصوير كارت ملي، صفحات اول تا سوم شناسنامه، مدرك تحصيلي يا كارنامه، گواهي امتيازات (حفظ قرآن، نهج البلاغه، خانواده ايثارگر و...)؛'
    }
  ]

  constructor(private fb: FormBuilder,) {
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.pointForm = this.fb.group({
      'confirm': [false, [Validators.requiredTrue]],
    });
  }

  get form() {
    return this.pointForm;
  }

  resetForm() {
    this.pointForm.reset();
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    // console.log('Button ok clicked!');
    this.nextStep.emit();
    this.isVisible = false;
  }

  handleCancel(): void {
    // console.log('Button cancel clicked!');
    this.isVisible = false;
  }
}
