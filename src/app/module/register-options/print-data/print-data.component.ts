import {Component, EventEmitter, OnInit, Output, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {printDataModel} from './print-data.model';
import {PrintDataService} from './print-data.service';
import {FormBuilder, ReactiveFormsModule, UntypedFormGroup} from '@angular/forms';
import {MainPageService} from '../../mainpagecomponent/main-page.service';
import {UserProfileService} from '../../user-profile/user-profile.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {Subscription} from 'rxjs';
import {MinioService} from '../../../core/services/minio.service';

@Component({
  selector: 'app-print-data',
  standalone: true,
  imports: [
    CommonModule,
    NzRowDirective,
    NzColDirective,
    NzInputDirective,
    ReactiveFormsModule,
    NzButtonComponent,
    RouterLink,
    NzIconDirective,
  ],
  templateUrl: './print-data.component.html',
  styleUrl: './print-data.component.css'
})
export class PrintDataComponent implements OnInit, OnDestroy {
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
  path!: any;
  pathPicture!: any;

  @Output() nextStep4 = new EventEmitter<void>();

  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private mainPageService: MainPageService,
    private printService: PrintDataService,
    private userProfileService: UserProfileService,
    private router: Router,
    private minioService: MinioService,
  ) {
  }

  ngOnInit(): void {
    this.createForm();

    this.subscription.add(
      this.mainPageService.currentTenant$.subscribe(tenantData => {
        if (tenantData) {
          this.tenantId = tenantData.tenantId;
          this.tenantSection = tenantData.section;
          this.theme = tenantData.theme;
          console.log('Theme loaded from currentTenant$:', this.theme);

          this.loadUserDataForPrint();
        }
      })
    );

    const stored = this.mainPageService.getCurrentTenantFromStorage();
    if (stored) {
      this.tenantId = stored.tenantId;
      this.tenantSection = stored.section;
      this.theme = stored.theme;
      this.mainPageService.setCurrentTenant(stored.tenantId, stored.section);

      this.loadUserDataForPrint();
    } else {
      this.router.navigate(['/']);
      return;
    }

    this.subscription.add(
      this.printService.fullData$.subscribe((data: printDataModel) => {
        if (data) {
          this.data = data;
          this.patchForm(data);
        }
      })
    );

    this.printForm.disable();
  }

  private loadUserDataForPrint(): void {
    this.userProfileService.loadData(this.tenantId).subscribe({
      next: (res) => {

        if (res.result.files && res.result.files.length > 0 && res.result.files[0]?.url) {
          this.minioService.getDownloadUrl(res.result.files[0].url).subscribe({
            next: (res: any) => {
              this.path = res.result;
            },
            error: (err) => {
              console.error('خطا در دریافت URL:', err);
            }
          });
        }
        console.log('داده‌های کاربر برای چاپ:', res.result);
      },
      error: (err) => {
        console.error('خطا در لود داده‌های کاربر:', err);
      }
    });
  }

  createForm(): void {
    this.printForm = this.fb.group({
      fullName: [{value: '', disabled: true}],
      nationalCode: [{value: '', disabled: true}],
      email: [{value: '', disabled: true}],
      phoneNumber: [{value: '', disabled: true}],
      photo: [{value: null, disabled: true}],
    });
  }

  patchForm(data: printDataModel): void {
    this.printForm.patchValue({
      fullName: `${data.name || ''} ${data.family || ''}`.trim(),
      nationalCode: data.nationalCode,
      email: data.email,
      phoneNumber: data.phoneNumber,
      photo: data.photo
    });
  }

  print(): void {
    window.print();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
