import { Injectable } from '@angular/core';
import {ApiService} from '../../../core/services/api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EnterInformationService {

  private pathUrl = '/services/app/Applicant/GetIdentityInformation';

  constructor(private apiService: ApiService) { }

  getDataUser(nationalCode: string, jalaliBirthDate: string): Observable<any> {
    return this.apiService.get(this.pathUrl, { nationalCode, jalaliBirthDate });
  }
}
