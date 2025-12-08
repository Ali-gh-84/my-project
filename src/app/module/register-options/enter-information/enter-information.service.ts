import {Injectable} from '@angular/core';
import {ApiService} from '../../../core/services/api.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {dataKeep} from './enter-information-model';

@Injectable({
  providedIn: 'root',
})
export class EnterInformationService {

  private pathUrl = '/services/app/RegisterApplicant/';
  private userInfo = new BehaviorSubject<Partial<dataKeep>>({});
  readonly userInfo$ = this.userInfo.asObservable();
  private allInfo = new BehaviorSubject<any>({});
  readonly allInfo$ = this.allInfo.asObservable();
  private userId = new BehaviorSubject<any>({});
  readonly userId$ = this.userId.asObservable();

  setUserId(id: number) {
    this.userId.next(id);
  }

  getUserId() {
    return this.userId.value;
  }

  setAllInfo(data: any) {
    this.allInfo.next(data);
  }

  getAllInfo() {
    return this.allInfo.value;
  }

  updateUserInfo(info: Partial<dataKeep>) {
    this.userInfo.next({...this.userInfo.value, ...info});
  }

  constructor(private apiService: ApiService) {
  }

  getDataUser(nationalCode: string, jalaliBirthDate: string, tenantId: number): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetIdentityInformation`, {nationalCode, jalaliBirthDate, tenantId});
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

  getAllField(para: {
    Filter: string;
    Page: number;
    PageCount: number
  }, tenantId: number | undefined): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetAllField?TenantId=${tenantId}&Page=${para.Page}&PageCount=${para.PageCount}`).pipe(
      map(res => res.result.items)
    );
  }

  getAllSubField(para: { Filter: string, Page: number, PageCount: number }, fieldId: number): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetAllSubField?FieldId=${fieldId}&Page=${para.Page}&PageCount=${para.PageCount}`).pipe(
      map(res => res.result.items)
    );
  }

  getAllSchool(provinceName: string, tenantId: number | undefined, field: number, subField: number, nationalCode: number): Observable<any> {
    return this.apiService.get(`${this.pathUrl}GetAllSchool?provinceName=${provinceName}&TenantId=${tenantId}&fieldId=${field}&subField=${subField}&nationalCode=${nationalCode}`).pipe(
      map(res => res.result)
    );
  }

  registerUser(body: any): Observable<any> {
    return this.apiService.post(`${this.pathUrl}Create`, body);
  }
}
