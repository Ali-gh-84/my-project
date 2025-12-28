import {Injectable} from '@angular/core';
import {Observable, of, tap} from 'rxjs';
import {ApiService} from '../../../core/services/api.service';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImportantOptionService {

  private pathUrl = '/services/app/TenantSettings/';
  private storageKeyPrefix = 'tenant_display_text_';

  constructor(private apiService: ApiService) {
  }

  getTenantDisplayTexts(tenantId: number | null): Observable<any> {
    const key = this.storageKeyPrefix + tenantId;

    const cached = localStorage.getItem(key);
    if (cached) {
      return of(JSON.parse(cached));
    }

    return this.apiService
      .get(`${this.pathUrl}GetTenantDisplayTextSettingNames?tenantId=${tenantId}`)
      .pipe(
        map(res => res?.result ?? {}),
        tap(result => {
          localStorage.setItem(key, JSON.stringify(result));
        })
      );
  }

  getText(
    tenantId: number | null,
    field: any
  ): Observable<string> {
    return this.getTenantDisplayTexts(tenantId).pipe(
      map(texts => texts[field] || '')
    );
  }

  clearCache(tenantId: number) {
    localStorage.removeItem(this.storageKeyPrefix + tenantId);
  }

  // getTenantDisplayText(tenantId: number): Observable<any> {
  //   return this.apiService.get(
  //     `${this.pathUrl}GetTenantDisplayTextSettingNames?tenantId=${tenantId}`
  //   );
  // }
}
