import { Component, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule, NgFor } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Router, RouterModule, ActivatedRoute, Params } from '@angular/router';
import { TenantCard } from './main-page-model';
import { PersianDigitsPipe } from '../../share/pipes/persian-digits.pipe';
import { MainPageService } from './main-page.service';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { UserProfileService } from '../user-profile/user-profile.service';
import { NzMessageService } from 'ng-zorro-antd/message';

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
export class MainPageComponent implements OnInit {

  cards: TenantCard[] = [];
  loading = true;
  personalPageDisabled: Record<number, boolean> = {};

  constructor(
    private mainPageService: MainPageService,
    private userProfileService: UserProfileService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    const ticket = this.route.snapshot.queryParamMap.get('ticket');

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {ticket: null},
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    if (ticket) {
      this.handleCasCallback(ticket);
    } else {
      this.loadTenants();
    }
  }

  private loadTenants(): void {
    this.mainPageService.getTenantList().subscribe({
      next: (data) => {
        this.cards = data;
        this.loading = false;

        data.forEach(card => this.checkUserProfileForTenant(card.id));
      },
      error: () => this.loading = false
    });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  isPersonalPageDisabled(tenantId: number): boolean {
    return !this.isLoggedIn() || this.personalPageDisabled[tenantId];
  }

  private checkUserProfileForTenant(tenantId: number): void {
    this.userProfileService.loadData(tenantId).subscribe({
      next: (res) => {
        this.personalPageDisabled[tenantId] = res.result === null;
      },
      error: (err) => {
        // this.message.error(err?.error?.message || 'خطا در دریافت اطلاعات');
      }
    });
  }

  private handleCasCallback(ticket: string): void {
    this.mainPageService.validateCasTicket(ticket).subscribe({
      next: (response) => {
        const result = response.result;
        const expiresAt = Date.now() + result.expireInSeconds * 1000;

        this.mainPageService.setInformationFromEhraz(result.uerRegisteredInEhraz);

        localStorage.setItem('userRegisteredInEhraz', JSON.stringify(result.uerRegisteredInEhraz));
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('userId', result.userId.toString());
        localStorage.setItem('expiresAt', expiresAt.toString());

        const intendedUrl = localStorage.getItem('intendedUrl');

        localStorage.removeItem('intendedUrl');

        if (intendedUrl && intendedUrl !== '/') {
          this.router.navigateByUrl(intendedUrl);
        } else {
          this.router.navigate(['/']);
        }
      }
    });
  }

  onButtonClick(action: string, card: TenantCard): void {
    const tenantId = card.id;

    this.mainPageService.setCurrentTenant(tenantId, card.section);

    this.mainPageService.getPeriodInformation(tenantId).subscribe({
      next: (res) => {
        localStorage.setItem('period_id', res.result.periodId.toString());
        this.mainPageService.periodInformations.next(res.result);
        localStorage.setItem('tenant_id', tenantId.toString());
      },
      error: () => {
        // this.mainPageService.periodInformations.next({ tenantId });
      }
    });

    const routes: Record<string, string> = {
      register: `/register/${tenantId}`,
      personalPage: `/info/${tenantId}`,
      capacity: `/capacity/${tenantId}`
    };

    this.router.navigateByUrl(routes[action]);
  }

  trackById(_: number, item: TenantCard): number {
    return item.id;
  }
}
