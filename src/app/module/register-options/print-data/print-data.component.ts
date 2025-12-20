import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {printDataModel} from './print-data.model';
import {PrintDataService} from './print-data.service';
import {FormBuilder, ReactiveFormsModule, UntypedFormGroup} from '@angular/forms';
import {ImportantOptionService} from '../important-option/important-option.service';
import {MainPageService} from '../../mainpagecomponent/main-page.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzInputDirective} from 'ng-zorro-antd/input';

@Component({
  selector: 'app-print-data',
  standalone: true,
  imports: [
    CommonModule,
    NzRowDirective,
    NzColDirective,
    NzInputDirective,
    ReactiveFormsModule,
  ],
  templateUrl: './print-data.component.html',
  styleUrl: './print-data.component.css'
})
export class PrintDataComponent {
  data: printDataModel = {
    name: '',
    family: '',
    fatherName: '',
    nationalCode: '',
    phoneNumber: '',
    email: '',
    photo: null
  };
  printForm!: UntypedFormGroup;
  today = new Date();
  tenantSection!: number;
  theme: any = {};
  tenantId!: number;
  @Output() nextStep4 = new EventEmitter<void>();

  constructor(private fb: FormBuilder,
              private importantOptionService: ImportantOptionService,
              private mainPageService: MainPageService,
              private printService: PrintDataService,
              private route: ActivatedRoute,
              private router: Router,) {
  }

  ngOnInit() {

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

    this.createForm();

    this.printService.fullData$
      .subscribe((data: printDataModel) => {
        this.data = data;
        this.patchForm(data);
      });
  }

  createForm() {
    this.printForm = this.fb.group({
      fullName: [{ value: null, disabled: true }],
      nationalCode: [{ value: null, disabled: true }],
      email: [{ value: null, disabled: true }],
      phoneNumber: [{ value: null, disabled: true }]
    });
  }

  patchForm(data: printDataModel) {
    this.printForm.patchValue({
      fullName: `${data.name} ${data.family}`,
      nationalCode: data.nationalCode,
      email: data.email,
      phoneNumber: data.phoneNumber
    });
  }

  print() {
    window.print();
  }
}
