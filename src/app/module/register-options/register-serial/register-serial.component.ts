import {Component, EventEmitter, Output} from '@angular/core';
import {NzButtonModule, NzButtonSize} from 'ng-zorro-antd/button';
import {FormGroup, FormsModule, Validators} from '@angular/forms';
import {FormBuilder} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {ImportantOptionService} from '../important-option/important-option.service';
import {MainPageService} from '../../mainpagecomponent/main-page.service';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {RegisterSerialService} from './register-serial.service';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'app-register-serial',
  standalone: true,
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
    NzInputDirective
  ],
  templateUrl: './register-serial.component.html',
  styleUrl: './register-serial.component.css'
})
export class RegisterSerialComponent {

  @Output() nextStep1 = new EventEmitter<void>();
  serialForm!: FormGroup;
  size: NzButtonSize = 'large';
  theme: any = {};
  tenantSection!: number;
  tenantId!: number;

  constructor(private fb: FormBuilder,
              private importantOptionService: ImportantOptionService,
              private registerSerialService: RegisterSerialService,
              private mainPageService: MainPageService,
              private message: NzMessageService,
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
  }

  createForm() {
    this.serialForm = this.fb.group({
      serial: ['', [
        Validators.required,
      ]]
    });
  }

  get form() {
    return this.serialForm;
  }

  resetForm() {
    this.serialForm.reset();
  }

  createMessage(type: string, content: string): void {
    this.message.create(type, content);
  }

  nextStep() {
    const serial = this.serialForm.get('serial')?.value;
    console.log(this.tenantId, serial);
    this.registerSerialService.setSerialCode(serial);
    this.registerSerialService.registerUser(serial, this.tenantId).subscribe(
      res => {
        if (res.result) {
          // console.log(res.result);
          this.nextStep1.emit();
        } else {
          this.createMessage('error', 'کد رهگیری اشتباه است.');
          // console.log(res.result);
        }
      }, error => {
        console.log(error.error.message);
      }
    )
  }
}
