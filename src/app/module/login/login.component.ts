import {Component} from '@angular/core';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzButtonComponent, NzButtonSize} from 'ng-zorro-antd/button';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {ActivatedRoute, Router} from '@angular/router';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {isValidNationalCode, isValidPhoneNumber} from '../../share/helpers/help';
import {NgIf} from '@angular/common';
import {SafeHtmlPipe} from '../../share/pipes/safe-html.pipe';
import {ImportantOptionService} from '../register-options/important-option/important-option.service';
import {MainPageService} from '../mainpagecomponent/main-page.service';
import {LoginService} from './login.service';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NzColDirective,
    NzRowDirective,
    ReactiveFormsModule,
    NzFormControlComponent,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzButtonComponent,
    NzWaveDirective,
    NzInputDirective,
    NgIf,
    SafeHtmlPipe
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  verifyUser!: FormGroup;
  sendData!: FormGroup;
  size: NzButtonSize = 'large';
  tenantSection!: number;
  text: string = '';
  theme: any = {};
  data: any;
  tenantId!: number | null;
  isVerified = false;

  constructor(
    private loginService: LoginService,
    private mainPageService: MainPageService,
    private importantOptionService: ImportantOptionService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
  ) {
  }

  ngOnInit() {
    const tenantId = this.route.snapshot.paramMap.get('tenantId');
    const tid = +tenantId!;
    this.tenantId = Number(tenantId);

    if (!tenantId || isNaN(tid)) {
      this.router.navigate(['/']);
      return;
    }

    this.importantOptionService.getTenantDisplayText(tenantId).subscribe(res => {
      this.text = res.result.trackingCodePageText;
    });

    this.mainPageService.getTenantList().subscribe(cards => {
      const currentTenant = cards.find(c => +c.id === tid || c.section === tid);
      if (currentTenant) {
        this.tenantSection = currentTenant.section;
        this.theme = this.mainPageService.getTenantTheme(this.tenantSection);
      }
    });

    this.createForms();
  }

  createForms() {
    this.verifyUser = this.fb.group({
      verifyCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
    });

    this.sendData = this.fb.group({
      nationalCode: ['', [Validators.required, isValidNationalCode]],
      cellphone: ['', [Validators.required, isValidPhoneNumber]]
    });
  }

  verifyUserLogin() {
    const formValueDataUser = this.sendData.value;
    const formValueVerifyUser = this.verifyUser.value;
    if (this.verifyUser.valid) {
      console.log('Login with national:', this.verifyUser.value);

      this.loginService.verifyCodeUser(formValueDataUser.nationalCode, formValueDataUser.cellphone, formValueVerifyUser.verifyCode).subscribe(
        res => {
          console.log(res.result);
          this.data = res.result;
          this.loginService.setUserDataProfile(res.result);
          this.router.navigate([`/info/${this.tenantId}`]);
        }, error => {
          console.log(error);
          this.createMessage('error', error.error.message);
        }
      )
    }
  }

  createMessage(type: string, content: string): void {
    this.message.create(type, content);
  }

  loginWithNationalCode() {
    const formValue = this.sendData.value;
    if (this.sendData.valid) {
      console.log('Login with national:', this.sendData.value);

      this.loginService.signInUser(formValue.nationalCode, formValue.cellphone).subscribe({
        next: (res) => {
          if (res.success) {
            this.isVerified = true;
          } else {
            this.createMessage('error', 'اطلاعات معتبر نیست');
          }
        },
        error: (err) => {
          console.error(err.error.message);
          this.createMessage('error', err.error.message);
        }
      });
    }
  }
}
