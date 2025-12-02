import { Injectable } from '@angular/core';
import {ApiService} from '../../../core/services/api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterSerialService {

  private pathUrl = '/services/app/RegisterApplicant/';

  constructor(private apiService: ApiService) {
  }

  registerUser(trackingCode: number, tenantId: number): Observable<any> {
    return this.apiService.post(`${this.pathUrl}CheckTrackingCode?trackingCode=${trackingCode}&tenantId=${tenantId}`);
  }
}
