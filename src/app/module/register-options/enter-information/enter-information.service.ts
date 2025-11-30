import {Injectable} from '@angular/core';
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

  private pathUrl = '/services/app/RegisterApplicant/';
  private userInfo = new BehaviorSubject<Partial<dataKeep>>({});
  readonly userInfo$ = this.userInfo.asObservable();

  updateUserInfo(info: Partial<dataKeep>) {
    this.userInfo.next({...this.userInfo.value, ...info});
  }

  constructor(private apiService: ApiService) {
  }

  getDataUser(nationalCode: string, jalaliBirthDate: string): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetIdentityInformation`, {nationalCode, jalaliBirthDate});
  }

  getDataUserEducations(nationalCode: string): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetStudentEducations`, {nationalCode});
  }

  getAllExemption(para: { Filter: string, Page: number, PageCount: number }): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetAllExemption?Page=${para.Page}&PageCount=${para.PageCount}`).pipe(
      map(res => res.result.items)
    );
  }

  getAllScore(para: { Filter: string, Page: number, PageCount: number }): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetAllScoreCriteria?Page=${para.Page}&PageCount=${para.PageCount}`).pipe(
      map(res => res.result.items)
    );
  }

  getAllProvince(para: { Filter: string, Page: number, PageCount: number }): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetAllProvince?Page=${para.Page}&PageCount=${para.PageCount}`).pipe(
      map(res => res.result.items)
    );
  }

  getAllCities(para: { Filter: string, Page: number, PageCount: number }, provinceId: number): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetAllCity?ProvinceId=${provinceId}&Page=${para.Page}&PageCount=${para.PageCount}`).pipe(
      map(res => res.result.items)
    );
  }
}
