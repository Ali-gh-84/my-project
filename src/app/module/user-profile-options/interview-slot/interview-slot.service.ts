import { Injectable } from '@angular/core';
import {ApiService} from '../../../core/services/api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InterviewSlotService {

  private pathUrl = '/services/app/RegisterApplicant/';

  constructor(private apiService: ApiService) {
  }

  getInterviewSlots(tenantId: number | null): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetSchoolInterviewSlots?tenantId=${tenantId}`);
  }

  reservationInterviewSlots(body: any): Observable<any> {
    return this.apiService.post(`${this.pathUrl}SaveApplicantInterviewSlot`, body);
  }


}
