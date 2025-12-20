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

  constructor(
    private mainPageService: MainPageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.mainPageService.getTenantList().subscribe({
      next: (data) => {
        console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', data)
        // this.section = data
        // this.sectionId = data.section;
        console.log('section id is : ', this.sectionId);
        this.cards = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });
    this.handleCasCallback();
  }

  handleCasCallback(): void {
    this.route.queryParams.subscribe((params: Params) => {
      const ticket = params['ticket'];
      if (ticket) {
        console.log('CAS Ticket received:', ticket);

        this.mainPageService.validateCasTicket(ticket).subscribe({
          next: (response) => {
            localStorage.setItem('access', response.access);

            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {ticket: null},
              queryParamsHandling: 'merge',
              replaceUrl: true
            });

            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('CAS validation failed:', err);
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
        this.mainPageService.periodInformations.next(res.result);
        localStorage.setItem('tenant_id', tenantId.toString());
      },
      error: (err) => {
        this.mainPageService.periodInformations.next({tenantId});
      }
    });

    const routes: Record<string, any[]> = {
      register: ['/register', tenantId],
      personalPage: ['/info', tenantId],
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
