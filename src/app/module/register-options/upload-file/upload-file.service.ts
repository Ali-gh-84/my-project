import { Injectable } from '@angular/core';
import {ApiService} from '../../../core/services/api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  private pathUrl = '/services/app/RegisterApplicant/';

  constructor(private apiService: ApiService) {
  }

  updateDocuments(body: any): Observable<any> {
    return this.apiService.put(`${this.pathUrl}UpdateApplicantDocuments`, body);
  }
}
