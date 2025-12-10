import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from '../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private pathUrl = '/services/app/RegisterApplicant/';
  private userDataProfile = new BehaviorSubject<number>(0);

  setUserDataProfile(data: any) {
    this.userDataProfile.next(data);
  }

  getUserDataProfile() {
    return this.userDataProfile.value;
  }

  constructor(private apiService: ApiService) {
  }

  signInUser(nationalCode: number, cellPhone: number): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetApplicantInSelfPanel?nationalCode=${nationalCode}&cellphone=${cellPhone}`);
  }

  verifyCodeUser(nationalCode: number, cellPhone: number, code: number): Observable<any> {
    return this.apiService.post(`${this.pathUrl}VerifyApplicantCode?nationalCode=${nationalCode}&cellphone=${cellPhone}&VerifyApplicantCode=${code}`);
  }
}
