import {Component} from '@angular/core';
import {NzButtonModule, NzButtonSize} from 'ng-zorro-antd/button';
import {CommonModule, NgFor} from '@angular/common';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {Router, RouterModule} from '@angular/router';
import {TenantCard} from './main-page-model';
import {PersianDigitsPipe} from '../../share/pipes/persian-digits.pipe';
import {MainPageService} from './main-page.service';
import {NzSpinComponent} from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-main-page-component',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    NzGridModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    RouterModule,
    PersianDigitsPipe,
    NzSpinComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {

  cards: TenantCard[] = [];
  loading: boolean = true;
  tenantId!: number;
  section!: number;

  constructor(
    private mainPageService: MainPageService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.mainPageService.getTenantList().subscribe({
      next: (data) => {
        console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',data)
        // this.section = data
        this.cards = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }

  onButtonClick(action: string, card: TenantCard) {
    const tenantId = card.id;

    this.mainPageService.getPeriodInformation(tenantId).subscribe({
      next: (res) => {
        this.mainPageService.periodInformations.next(res.result);
        this.tenantId = res.result.tenantId;
        localStorage.setItem('tenant_id', this.tenantId.toString());
        console.log('period data saved in service:', res.result);
      },
      error: (err) => {
        console.error('خطا در دریافت اطلاعات دوره', err);
        this.mainPageService.periodInformations.next({tenantId});
      }
    });

    const routes: Record<string, any[]> = {
      register: ['/register', tenantId],
      personalPage: ['/personal-info', tenantId],
      capacity: ['/capacity', tenantId]
    };

    const pathSegments = routes[action];
    if (pathSegments) {
      this.router.navigate(pathSegments);
    }
  }

  trackById(index: number, item: TenantCard): number {
    return item.id;
  }
}
