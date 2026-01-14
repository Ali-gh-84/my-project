import {Component} from '@angular/core';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {CommonModule, NgFor} from '@angular/common';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {Router, RouterModule, Params, ActivatedRoute} from '@angular/router';
import {TenantCard} from './main-page-model';
import {PersianDigitsPipe} from '../../share/pipes/persian-digits.pipe';
import {MainPageService} from './main-page.service';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {UserProfileService} from '../user-profile/user-profile.service';
import {NzMessageService} from 'ng-zorro-antd/message';

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
  sectionId!: number;
  personalPageDisabled: { [tenantId: number]: boolean } = {};

  constructor(
    private mainPageService: MainPageService,
    private userProfileService: UserProfileService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
  ) {
  }

  ngOnInit(): void {

    this.handleCasCallback();
    this.mainPageService.getTenantList().subscribe({
      next: (data) => {
        this.cards = data;
        this.loading = false;

        // this.cards.forEach(card => {
        //   this.checkUserProfileForTenant(card.id);
        // });
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }

  createMessage(type: string, content: string): void {
    this.message.create(type, content);
  }

  // checkUserProfileForTenant(tenantId: number): void {
  //   this.userProfileService.loadData(tenantId).subscribe({
  //     next: (res) => {
  //       this.personalPageDisabled[tenantId] = res.result === null;
  //     },
  //     error: (err) => {
  //       console.log('Error loading profile for tenant', tenantId, err);
  //       this.createMessage('error', err.error.message);
  //       this.personalPageDisabled[tenantId] = true;
  //     }
  //   });
  // }

  handleCasCallback(): void {
    this.route.queryParams.subscribe((params: Params) => {
      const ticket = params['ticket'];
      if (ticket) {
        console.log('CAS Ticket received:', ticket);

        this.mainPageService.validateCasTicket(ticket).subscribe({
          next: (response) => {
            const loginTime = Date.now();
            const expireInMs = response.result.expireInSeconds * 1000;
            const expiresAt = loginTime + expireInMs;
            this.mainPageService.informationFromEhraz = response.result?.uerRegisteredInEhraz;
            console.log('data information from ehraz : ', this.mainPageService.informationFromEhraz);

            localStorage.setItem('accessToken', response.result.accessToken);
            localStorage.setItem('userId', response.result.userId.toString());
            localStorage.setItem('expiresAt', expiresAt.toString());

            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {ticket: null},
              queryParamsHandling: 'merge',
              replaceUrl: true
            });

            const intendedUrl = localStorage.getItem('intendedUrl');

            if (intendedUrl && intendedUrl !== '/' && intendedUrl !== '') {
              localStorage.removeItem('intendedUrl');

              this.router.navigateByUrl(intendedUrl);
            } else {
              this.router.navigate(['/']);
            }
          },
          error: (err) => {
            console.error('CAS validation failed:', err.error.message);
            this.createMessage('error', err.error.message);
          }
        });
      }
    });
  }

  onButtonClick(action: string, card: TenantCard) {
    const tenantId = card.id;
    const section = card.section;

    this.mainPageService.setCurrentTenant(tenantId, section);

    this.mainPageService.getPeriodInformation(tenantId).subscribe({
      next: (res) => {
        localStorage.setItem('period_id', res.result.periodId.toString());
        this.mainPageService.periodInformations.next(res.result);
        localStorage.setItem('tenant_id', tenantId.toString());
      },
      error: (err) => {
        this.mainPageService.periodInformations.next({tenantId});
      }
    });

    const routes: Record<string, string> = {
      register: `/register/${tenantId}`,
      personalPage: `/info/${tenantId}`,
      capacity: `/capacity/${tenantId}`
    };

    const targetUrl = routes[action];

    if (targetUrl) {
      localStorage.setItem('intendedUrl', targetUrl);

      this.router.navigateByUrl(targetUrl);
    }
  }

  trackById(index: number, item: TenantCard): number {
    return item.id;
  }
}
