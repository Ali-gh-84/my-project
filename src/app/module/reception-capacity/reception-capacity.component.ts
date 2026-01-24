import {Component} from '@angular/core';
import {NzTableModule, NzTableSortOrder} from 'ng-zorro-antd/table';
import {CommonModule} from '@angular/common';
import {ReceptionCapacityService} from './reception-capacity.service';
import {MainPageService} from '../mainpagecomponent/main-page.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ReceptionCapacity} from './reception-capacity.model';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {ImportantOptionService} from '../register-options/important-option/important-option.service';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {SafeHtmlPipe} from '../../share/pipes/safe-html.pipe';
import {NzMessageService} from 'ng-zorro-antd/message';
import { AgGridAngular } from 'ag-grid-angular';
import { ClientSideRowModelModule } from 'ag-grid-community'; // این را ایمپورت کنید اما در imports استفاده نکنید
// import { AllCommunityModule } from 'ag-grid-community'; // <--- تغییر مهم
// npm install ag-grid-angular@31.3.2 ag-grid-community@31.3.2


@Component({
  standalone: true,
  selector: 'app-reception-capacity',
  templateUrl: './reception-capacity.component.html',
  styleUrls: ['./reception-capacity.component.css'],
  imports: [CommonModule, NzTableModule, NzIconDirective, NzButtonComponent, NzColDirective, NzRowDirective, SafeHtmlPipe, RouterLink, AgGridAngular]
})
export class ReceptionCapacityComponent {

  // تست گرید
  modules = [ClientSideRowModelModule]; // AllCommunityModule

  colDefs: any[] = [
    { field: 'make' },
    { field: 'model' },
    { field: 'price' }
  ];

  rowData: any[] = [
    { make: 'ایران‌خودرو', model: 'پژو ۲۰۶', price: 1000 },
    { make: 'سایپا', model: 'شاهین', price: 1000 },
    { make: 'ایران‌خودرو', model: 'دنا', price: 1000 },
  ];

  defaultColDef: any = {
    sortable: true,
    filter: true,
    resizable: true
  };

  data: ReceptionCapacity[] = [];
  pageSize = 5;
  pageIndex = 1;
  total = 0;
  text: string = '';
  theme: any;
  tenantId: number | null = null;
  tenantSection: number | null = null;
  sortKey: string | null = null;
  sortOrder: NzTableSortOrder | null = null;

  constructor(
    private receptionCapacityService: ReceptionCapacityService,
    private mainPageService: MainPageService,
    private importantOptionService: ImportantOptionService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
  ) {
  }

  ngOnInit(): void {
    const stored = this.mainPageService.getCurrentTenantFromStorage();

    if (stored?.tenantId) {
      this.tenantId = stored.tenantId;
      this.tenantSection = stored.section;
      this.theme = stored.theme;
      console.log('theme', this.theme);
      document.documentElement.style.setProperty(
        '--primary-color',
        this.theme.primary
      );

      this.mainPageService.setCurrentTenant(stored.tenantId, stored.section);

      this.loadReceptionData();
      this.loadDisplayText();
    } else {
      console.warn('tenantId not found, redirecting to main page');
      this.router.navigate(['/']);
    }
  }

  createMessage(type: string, content: string): void {
    this.message.create(type, content);
  }

  private loadReceptionData(): void {
    if (this.tenantId === null) return;

    this.receptionCapacityService.getReception(this.tenantId).subscribe({
      next: (res: any) => {
        this.data = res.result || [];
        this.total = this.data.length;
        this.sortData();
      },
      error: (error: any) => {
        console.error('Error loading reception capacity:', error);
        this.createMessage('error', error.error.message || 'خطا در دریافت اطلاعات');
        this.data = [];
        this.total = 0;
      }
    });
  }

  sortData(): void {
    if (!this.sortKey || !this.sortOrder) {
      return;
    }

    this.data = [...this.data].sort((a, b) => {
      const valueA = a[this.sortKey as keyof ReceptionCapacity];
      const valueB = b[this.sortKey as keyof ReceptionCapacity];

      const numA = Number(valueA);
      const numB = Number(valueB);

      const compare = numA - numB;

      return this.sortOrder === 'ascend' ? compare : -compare;
    });
  }

  handleSort(key: string, order: NzTableSortOrder): void {
    this.sortKey = key;
    this.sortOrder = order;
    this.sortData();
  }

  private loadDisplayText(): void {
    this.importantOptionService
      .getText(this.tenantId, 'capacityReportPageText')
      .subscribe(text => this.text = text);
  }
}
