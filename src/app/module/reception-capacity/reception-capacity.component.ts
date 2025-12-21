import {Component} from '@angular/core';
import {NzTableModule} from 'ng-zorro-antd/table';
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

@Component({
  standalone: true,
  selector: 'app-reception-capacity',
  templateUrl: './reception-capacity.component.html',
  styleUrls: ['./reception-capacity.component.css'],
  imports: [CommonModule, NzTableModule, NzIconDirective, NzButtonComponent, NzColDirective, NzRowDirective, SafeHtmlPipe, RouterLink]
})
export class ReceptionCapacityComponent {

  data: ReceptionCapacity[] = [];
  pageSize = 5;
  pageIndex = 1;
  total = 0;
  sortKey!: string;
  sortOrder: 'ascend' | 'descend' | null = null;
  text: string = '';
  theme: any;
  tenantId: number | null = null;
  tenantSection: number | null = null;

  constructor(
    private receptionCapacityService: ReceptionCapacityService,
    private mainPageService: MainPageService,
    private importantOptionService: ImportantOptionService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    const stored = this.mainPageService.getCurrentTenantFromStorage();

    if (stored?.tenantId) {
      this.tenantId = stored.tenantId;
      this.tenantSection = stored.section;
      this.theme = stored.theme;

      this.mainPageService.setCurrentTenant(stored.tenantId, stored.section);

      this.loadReceptionData();
      this.loadDisplayText();
    } else {
      console.warn('tenantId not found, redirecting to main page');
      this.router.navigate(['/']);
    }
  }

  private loadReceptionData(): void {
    if (this.tenantId === null) return;

    this.receptionCapacityService.getReception(this.tenantId).subscribe({
      next: (res: any) => {
        this.data = res.result || [];
        this.total = this.data.length;
      },
      error: (error: any) => {
        console.error('Error loading reception capacity:', error);
        this.data = [];
        this.total = 0;
      }
    });
  }

  private loadDisplayText(): void {
    this.importantOptionService.getTenantDisplayText(this.tenantId!).subscribe({
      next: (res) => {
        this.text = res?.result.capacityReportPageText || '';
      },
      error: (err) => {
        console.error('Failed to load registration text', err);
        this.text = '';
      }
    });
  }

  onSort(sort: { key: string; value: 'ascend' | 'descend' | null }): void {
    this.sortKey = sort.key;
    this.sortOrder = sort.value;

    if (this.sortKey && this.sortOrder && this.data.length > 0) {
      this.data = [...this.data].sort((a: any, b: any) => {
        const aValue = a[this.sortKey];
        const bValue = b[this.sortKey];

        if (this.sortOrder === 'ascend') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }
  }
}
