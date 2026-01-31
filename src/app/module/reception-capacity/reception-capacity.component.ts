import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {AgGridAngular} from 'ag-grid-angular';
import {ColDef, GridOptions} from 'ag-grid-community';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ReceptionCapacityService} from './reception-capacity.service';
import {MainPageService} from '../mainpagecomponent/main-page.service';
import {ImportantOptionService} from '../register-options/important-option/important-option.service';
import {ReceptionCapacity} from './reception-capacity.model';
import {SafeHtmlPipe} from '../../share/pipes/safe-html.pipe';

@Component({
  standalone: true,
  selector: 'app-reception-capacity',
  templateUrl: './reception-capacity.component.html',
  styleUrls: ['./reception-capacity.component.css'],
  imports: [
    CommonModule,
    AgGridAngular,
    NzButtonComponent,
    NzIconDirective,
    NzColDirective,
    NzRowDirective,
    SafeHtmlPipe,
    RouterLink,
  ]
})
export class ReceptionCapacityComponent implements OnInit {

  columnDefs: ColDef[] = [
    {
      field: 'capacityDormitory',
      headerName: 'ظرفیت شبانه‌روزی',
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'capacityDaily',
      headerName: 'ظرفیت روزانه',
      filter: 'agNumberColumnFilter'
    },
    {field: 'fieldName', headerName: 'رشته', flex: 1.5},
    {field: 'cityName', headerName: 'شهر', flex: 1},
    {field: 'provinceName', headerName: 'استان', flex: 1},
    {field: 'schoolName', headerName: 'نام مدرسه', flex: 2},
  ];
  gridOptions: GridOptions = {
    icons: {
      sortAscending: `
      <svg width="14" height="14" viewBox="0 0 24 24">
        <path d="M6 15l6 6 6-6H6z" fill="currentColor"/>
      </svg>`,
      sortDescending: `
      <svg width="14" height="14" viewBox="0 0 24 24">
        <path d="M6 9l6-6 6 6H6z" fill="currentColor"/>
      </svg>`,
      filter: `
      <svg width="14" height="14" viewBox="0 0 24 24">
        <path d="M3 4h18v2H3zM6 10h12v2H6zM9 16h6v2H9z" fill="currentColor"/>
      </svg>`,
      next: '<svg width="12" height="12" viewBox="0 0 24 24"><path d="M8 5l8 7-8 7V5z" fill="currentColor"/></svg>',
      previous: '<svg width="12" height="12" viewBox="0 0 24 24"><path d="M16 19l-8-7 8-7v14z" fill="currentColor"/></svg>',
      first: '<svg width="12" height="12" viewBox="0 0 24 24"><path d="M18 19H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V9h12v2zm0-4H6V5h12v2z" fill="currentColor"/></svg>',
      last: '<svg width="12" height="12" viewBox="0 0 24 24"><path d="M6 5h12v2H6V5zm0 4h12v2H6V9zm0 4h12v2H6v-2zm0 4h12v2H6v-2z" fill="currentColor"/></svg>',
    }
  };

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  rowData: ReceptionCapacity[] = [];
  paginationPageSize = 20;
  text = '';
  tenantId: number | null = null;
  theme: any;

  localeText = {
    page: 'صفحه',
    more: 'بیشتر',
    to: 'تا',
    of: 'از',
    next: 'بعدی',
    last: 'آخر',
    first: 'اول',
    previous: 'قبلی',
    loadingOoo: 'در حال بارگذاری...',
    noRowsToShow: 'داده‌ای برای نمایش وجود ندارد',

    filterOoo: 'فیلتر...',
    equals: 'مساوی',
    notEqual: 'نامساوی',
    lessThan: 'کمتر از',
    greaterThan: 'بیشتر از',
    contains: 'شامل',
    notContains: 'شامل نباشد',
    startsWith: 'شروع با',
    endsWith: 'پایان با',

    sortAscending: 'صعودی',
    sortDescending: 'نزولی',
    sortNone: 'بدون مرتب‌سازی',
    pageSize: 'تعداد آیتم در صفحه',
  };


  constructor(
    private receptionCapacityService: ReceptionCapacityService,
    private mainPageService: MainPageService,
    private importantOptionService: ImportantOptionService,
    private router: Router,
    private message: NzMessageService
  ) {
  }

  ngOnInit(): void {
    const storedTenant = this.mainPageService.getCurrentTenantFromStorage();

    if (!storedTenant?.tenantId) {
      this.router.navigate(['/']);
      return;
    }

    this.tenantId = storedTenant.tenantId;
    this.theme = storedTenant.theme;

    document.documentElement.style.setProperty(
      '--primary-color',
      this.theme.primary
    );

    this.mainPageService.setCurrentTenant(
      storedTenant.tenantId,
      storedTenant.section
    );

    this.loadReceptionData();
    this.loadDisplayText();
  }

  private loadReceptionData(): void {
    if (!this.tenantId) return;

    this.receptionCapacityService.getReception(this.tenantId).subscribe({
      next: res => {
        this.rowData = res.result || [];
      },
      error: err => {
        console.error(err);
        this.message.error(err?.error?.message || 'خطا در دریافت اطلاعات');
        this.rowData = [];
      }
    });
  }

  private loadDisplayText(): void {
    if (!this.tenantId) return;

    this.importantOptionService
      .getText(this.tenantId, 'capacityReportPageText')
      .subscribe(text => (this.text = text));
  }
}
