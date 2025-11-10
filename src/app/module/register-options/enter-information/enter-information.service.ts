import { Injectable } from '@angular/core';
import {ApiService} from '../../../core/services/api.service';
import {Observable} from 'rxjs';
import {printDataModel} from '../print-data/print-data.model';
import {combineLatest, map} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {dataKeep} from './enter-information-model';

@Injectable({
  providedIn: 'root',
})
export class EnterInformationService {

  private pathUrl = '/services/app/Applicant/GetIdentityInformation';
  private userInfo = new BehaviorSubject<Partial<dataKeep>>({});

  // فقط مقادیر اصلی که همیشه داریم
  readonly userInfo$ = this.userInfo.asObservable();

  updateUserInfo(info: Partial<dataKeep>) {
    this.userInfo.next({ ...this.userInfo.value, ...info });
  }

  // فقط برای تست یا fallback
  getCurrentUserInfo(): Partial<dataKeep> {
    return this.userInfo.value;
  }

  constructor(private apiService: ApiService) { }

  getDataUser(nationalCode: string, jalaliBirthDate: string): Observable<any> {
    return this.apiService.get(this.pathUrl, { nationalCode, jalaliBirthDate });
  }
}
