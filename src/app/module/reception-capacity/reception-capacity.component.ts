import {Component} from '@angular/core';
import {NzTableModule} from 'ng-zorro-antd/table';
import {CommonModule} from '@angular/common';
import {ReceptionCapacityService} from './reception-capacity.service';
import {MainPageService} from '../mainpagecomponent/main-page.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ReceptionCapacity} from './reception-capacity.model';

@Component({
  standalone: true,
  selector: 'app-reception-capacity',
  templateUrl: './reception-capacity.component.html',
  styleUrls: ['./reception-capacity.component.css'],
  imports: [CommonModule, NzTableModule]
})
export class ReceptionCapacityComponent {

  data: ReceptionCapacity[] = [];
  tenantId!: number;
  pageSize = 5;
  pageIndex = 1;
  total = 0;
  sortKey!: string;
  sortOrder: 'ascend' | 'descend' | null = null;

  constructor(
    private receptionCapacityService: ReceptionCapacityService,
    private mainPageService: MainPageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }


  ngOnInit() {
    const tenantId = this.route.snapshot.paramMap.get('tenantId');
    this.tenantId = Number(tenantId);

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
