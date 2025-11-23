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

  constructor(
    private tenantService: MainPageService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.tenantService.getTenantList().subscribe({
      next: (data) => {
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

    const routes: Record<string, string> = {
      register: `/register/${tenantId}`,
      personalPage: `/personal-info/${tenantId}`,
      capacity: `/capacity/${tenantId}`
    };

    const path = routes[action];
    if (path) {
      this.router.navigate([path]);
    }
    console.log('path: : : : : ', path)
  }

  trackById(index: number, item: TenantCard): number {
    return item.id;
  }
}
