import { Injectable } from '@angular/core';
import {ApiService} from '../../../core/services/api.service';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterSerialService {

  private pathUrl = '/services/app/RegisterApplicant/';
  private serialCodeSource = new BehaviorSubject<number>(0);
  serialCode$ = this.serialCodeSource.asObservable();

  setSerialCode(serial: number) {
    this.serialCodeSource.next(serial);
  }

  getCurrentSerialCode() {
    return this.serialCodeSource.value;
  }

  constructor(private apiService: ApiService) {
  }

  registerUser(trackingCode: number, tenantId: number): Observable<any> {
    return this.apiService.post(`${this.pathUrl}CheckTrackingCode?trackingCode=${trackingCode}&tenantId=${tenantId}`);
  }
}
