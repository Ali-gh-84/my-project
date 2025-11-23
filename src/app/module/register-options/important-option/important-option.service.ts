import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class ImportantOptionService {

  private pathUrl = '/services/app/TenantSettings/';

  constructor(private apiService: ApiService) {
  }

  getTenantDisplayText(tenantId: string | null): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetTenantDisplayTextSettingNames?tenantId=${tenantId}`);
  }
}
