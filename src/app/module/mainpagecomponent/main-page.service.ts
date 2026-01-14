import {Injectable} from '@angular/core';
import {ApiService} from '../../core/services/api.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {CardButton, TenantCard, TenantDto} from './main-page-model';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MainPageService {

  private pathUrl = '/services/app/RegisterApplicant/';
  private apiUrlToken = '/TokenAuth/';
  periodInformations = new BehaviorSubject<any>({});
  informationFromEhraz = new BehaviorSubject<any>({});


  constructor(private apiService: ApiService) {
  }

  validateCasTicket(ticket: any): Observable<any> {
    return this.apiService.get(`${this.apiUrlToken}AuthenticateFromEhraz/?ticket=${ticket}`);
  }

  getTenantList(): Observable<TenantCard[]> {
    return this.apiService.get(`${this.pathUrl}GetTenantList`).pipe(
      map(res => res.result
        .filter((t: { isActive: any }) => t.isActive)
        .map((tenant: TenantDto) => this.mapToCard(tenant))
      )
    )
  }

  getPeriodInformation(tenantId: number | null): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetPriodInformation?tenantId=${tenantId}`);
  }

  private mapToCard(tenant: TenantDto): TenantCard {
    const themes: Record<number, {
      colorText: string;
      overlay: string;
      img: string;
      buttons: CardButton[];
    }> = {
      1: {
        colorText: '#4CA6A7',
        overlay: 'rgba(234, 248, 249, 0.5)',
        img: './assets/pictures/user-2.png',
        buttons: [
          {text: 'صفحه شخصی داوطلبین', color: '#4ca6a7', bgcolor: '#ffffff', action: 'personalPage'},
          {text: 'ثبت نام', color: '#ffffff', bgcolor: '#7FD8DE', action: 'register'},
          {text: 'ظرفیت پذیرش', color: '#ffffff', bgcolor: '#4CA6A7', action: 'capacity'}
        ]
      },
      2: {
        colorText: '#AC7196',
        overlay: 'rgba(249, 233, 243, 0.5)',
        img: './assets/pictures/user-3.png',
        buttons: [
          {text: 'صفحه شخصی داوطلبین', color: '#834E6F', bgcolor: '#ffffff', action: 'personalPage'},
          {text: 'ثبت نام', color: '#ffffff', bgcolor: '#E0A8CB', action: 'register'},
          {text: 'ظرفیت پذیرش', color: '#ffffff', bgcolor: '#AC7196', action: 'capacity'}
        ]
      },
      3: {
        colorText: '#83B778',
        overlay: 'rgba(235, 249, 232, 0.5)',
        img: './assets/pictures/user-4.png',
        buttons: [
          {text: 'صفحه شخصی داوطلبین', color: '#9FC497', bgcolor: '#ffffff', action: 'personalPage'},
          {text: 'ثبت نام', color: '#ffffff', bgcolor: '#B2DAAA', action: 'register'},
          {text: 'ظرفیت پذیرش', color: '#ffffff', bgcolor: '#83B778', action: 'capacity'}
        ]
      }
    };

    const theme = themes[tenant.section];

    if (!theme) {
      return {
        ...tenant,
        title: `داوطلبین سطح ${tenant.section}`,
        degree: tenant.section.toString(),
        colorText: '#999999',
        overlay: 'rgba(0,0,0,0.05)',
        img: './assets/pictures/user-default.png',
        buttons: []
      };
    }

    return {
      ...tenant,
      title: `داوطلبین سطح ${tenant.section}`,
      degree: tenant.section.toString(),
      colorText: theme.colorText,
      overlay: theme.overlay,
      img: theme.img,
      buttons: theme.buttons
    };
  }

  getTenantTheme(section: number) {
    const themes: Record<number, {
      primary: string;
      light: string;
      medium: string;
      high: string;
      panels: string;
      text: string;
      overlay: string;
    }> = {
      1: {
        primary: '#65BDE3',
        light: '#65DAE3',
        medium: '#42A3D3',
        high: '#217EAD',
        panels: '#C9F0F3',
        text: '#ffffff',
        overlay: 'rgba(234, 248, 249, 0.5)'
      },

      2: {
        primary: '#D080B3',
        light: '#DFA1C8',
        medium: '#B55792',
        high: '#984679',
        panels: '#ffd9f1',
        text: '#ffffff',
        overlay: '#F9E9F3'
      },

      3: {
        primary: '#81B376',
        light: '#9AC991',
        medium: '#609952',
        high: '#46793B',
        panels: '#EBF9E8',
        text: '#ffffff',
        overlay: 'rgba(235, 249, 232, 0.5)'
      }
    };

    return themes[section] || {
      primary: '#666666',
      light: '#aaaaaa',
      text: '#ffffff',
      overlay: 'rgba(0,0,0,0.05)'
    };
  }

  private currentTenantSubject = new BehaviorSubject<{
    tenantId: number;
    section: number;
    theme: any;
  } | null>(null);

  currentTenant$ = this.currentTenantSubject.asObservable();

  setCurrentTenant(tenantId: number, section: number) {
    const theme = this.getTenantTheme(section);
    const tenantData = { tenantId, section, theme };

    this.currentTenantSubject.next(tenantData);

    localStorage.setItem('currentTenant', JSON.stringify(tenantData));
  }

  getCurrentTenantFromStorage(): { tenantId: number; section: number; theme: any } | null {
    const stored = localStorage.getItem('currentTenant');
    return stored ? JSON.parse(stored) : null;
  }

  clearCurrentTenant() {
    this.currentTenantSubject.next(null);
    localStorage.removeItem('currentTenant');
  }
}
