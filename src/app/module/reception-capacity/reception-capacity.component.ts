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
  tenantId!: number;
  pageSize = 5;
  pageIndex = 1;
  total = 0;
  sortKey!: string;
  sortOrder: 'ascend' | 'descend' | null = null;
  text: string = '';
  tenantSection!: number;
  theme: any = {};

  constructor(
    private receptionCapacityService: ReceptionCapacityService,
    private mainPageService: MainPageService,
    private importantOptionService: ImportantOptionService,
    private router: Router,
    private route: ActivatedRoute
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
      this.text = res.result.capacityReportPageText;
    });

    this.mainPageService.getTenantList().subscribe(cards => {
      const currentTenant = cards.find(c => +c.id === tid || c.section === tid);
      if (currentTenant) {
        this.tenantSection = currentTenant.section;
        this.theme = this.mainPageService.getTenantTheme(this.tenantSection);
      }
    });

    this.getAllReceptionCapacity();
  }

  getAllReceptionCapacity() {
    this.receptionCapacityService.getReception(this.tenantId).subscribe({
      next: (res: any) => {
        this.data = res.result || [];
        this.total = this.data.length;
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  onSort(sort: { key: string; value: 'ascend' | 'descend' | null }) {
    this.sortKey = sort.key;
    this.sortOrder = sort.value;

    if (this.sortKey && this.sortOrder) {
      this.data = [...this.data.sort((a: any, b: any) =>
        this.sortOrder === 'ascend'
          ? a[this.sortKey] > b[this.sortKey] ? 1 : -1
          : b[this.sortKey] > a[this.sortKey] ? 1 : -1
      )];
    }
  }
}
