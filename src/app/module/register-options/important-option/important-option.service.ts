import {Injectable} from '@angular/core';
import {Observable, of, tap} from 'rxjs';
import {ApiService} from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class ImportantOptionService {

  private pathUrl = '/services/app/TenantSettings/';
  private displayTextCache = new Map<number, any>();
  private loadingCache = new Map<number, boolean>();

  constructor(private apiService: ApiService) {
  }

  getTenantDisplayText(tenantId: number): Observable<any> {
    if (this.displayTextCache.has(tenantId)) {
      return of(this.displayTextCache.get(tenantId));
    }

    if (this.loadingCache.get(tenantId)) {
      return new Observable(observer => {
        const interval = setInterval(() => {
          if (this.displayTextCache.has(tenantId)) {
            clearInterval(interval);
            observer.next(this.displayTextCache.get(tenantId));
            observer.complete();
          }
        }, 100);
      });
    }

    this.loadingCache.set(tenantId, true);

    return this.apiService.get(`${this.pathUrl}GetTenantDisplayTextSettingNames?tenantId=${tenantId}`).pipe(
      tap(response => {
        this.displayTextCache.set(tenantId, response.result);
        this.loadingCache.delete(tenantId);
      })
    );
  }

  getCachedDisplayText(tenantId: number): any | null {
    return this.displayTextCache.get(tenantId) || null;
  }
}
