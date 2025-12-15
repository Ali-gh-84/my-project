import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {ApiService} from '../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private pathUrl = '/services/app/RegisterApplicant/';
  private userDataProfile = new BehaviorSubject<any>(null);

  setUserDataProfile(data: any) {
    this.userDataProfile.next(data);
  }

  getUserDataProfile() {
    return this.userDataProfile.value;
  }

  constructor(private apiService: ApiService) {
  }

  signInUser(tenantId: number | null, nationalCode: number, cellPhone: number): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetApplicantInSelfPanel?tenantId=${tenantId}&nationalCode=${nationalCode}&cellphone=${cellPhone}`);
  }

  verifyCodeUser(tenantId: number | null, nationalCode: number, cellPhone: number, code: number): Observable<any> {
    return this.apiService.post(`${this.pathUrl}VerifyApplicantCode?tenantId=${tenantId}&nationalCode=${nationalCode}&cellphone=${cellPhone}&verificationCode=${code}`);
  }
}
