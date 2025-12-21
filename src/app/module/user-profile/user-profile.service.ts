import { Injectable } from '@angular/core';
import {ApiService} from '../../core/services/api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private pathUrl = '/services/app/RegisterApplicant/';

  constructor(private apiService: ApiService) {
  }

  loadData(tenantId: number | null): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetApplicantInfo?tenantId=${tenantId}`);
  }
}
