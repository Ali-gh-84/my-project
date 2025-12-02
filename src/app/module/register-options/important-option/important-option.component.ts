import {Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzButtonModule, NzButtonSize} from 'ng-zorro-antd/button';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {CommonModule} from '@angular/common';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {ImportantOptionService} from './important-option.service';
import {SafeHtmlPipe} from '../../../share/pipes/safe-html.pipe';
import {MainPageService} from '../../mainpagecomponent/main-page.service';

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
    NzCheckboxModule,
    SafeHtmlPipe,
  ],
  standalone: true,
  templateUrl: './important-option.component.html',
  styleUrl: './important-option.component.css'
})
export class ImportantOptionComponent {

  @Output() nextStep = new EventEmitter<void>();
  pointForm!: FormGroup;
  size: NzButtonSize = 'large';
  isVisible = false;
  text!: string;
  tenantSection!: number;
  theme: any = {};

  buttonInfo!: any[];

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

    this.importantOptionService.getTenantDisplayText(tenantId).subscribe(res => {
      this.text = res.result.registrationPageText;
    });

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

  handleOk(): void {
    // console.log('Button ok clicked!');
    this.nextStep.emit();
    this.isVisible = false;
  }
}
