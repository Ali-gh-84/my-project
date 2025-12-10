import { Injectable } from '@angular/core';
import {ApiService} from '../../core/services/api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceptionCapacityService {

  private pathUrl = '/services/app/RegisterApplicant/';

  constructor(private apiService: ApiService) {
  }

  getReception(tenantId: number): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetCapacitySchools?tenantId=${tenantId}`);
  }
}
