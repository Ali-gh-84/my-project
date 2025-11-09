import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.apiUrl}${environment.apiEndpoint}`;
  }

  private formatErrors(error: any) {
    return throwError(error.error);
  }

  get(path: string, body?: any): Observable<any> {
    const params = new HttpParams({fromObject: body});
    return this.http.get(`${this.apiUrl}${path}`, {params}).pipe(catchError(this.formatErrors));
  }

  post(path: string, body: any = {}): Observable<any> {
    return this.http.post(`${this.apiUrl}${path}`, body).pipe(catchError(this.formatErrors));
  }

  put(path: string, body: any = {}): Observable<any> {
    return this.http.put(`${this.apiUrl}${path}`, body).pipe(catchError(this.formatErrors));
  }

  delete(path: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}${path}`).pipe(catchError(this.formatErrors));
  }
  //
  // upload(path: string, body: object = {}): Observable<any> {
  //   return this.http
  //     .post(`${this.apiUrl}${path}`, body, {
  //       reportProgress: true,
  //       observe: 'events',
  //       withCredentials: false
  //     })
  //     .pipe(catchError(this.formatErrors));
  // }
  //
  // getFile(path: string) {
  //   return this.http
  //     .get(`${this.apiUrl}${path}`, {
  //       observe: 'response',
  //       responseType: 'blob',
  //       headers: {'Content-Type': 'application/octet-stream'}
  //     })
  //     .pipe(catchError(this.formatErrors));
  // }
  //
  // odata(path: string, body?, headers?: HttpHeaders): Promise<any> {
  //   const params = new HttpParams({fromObject: body});
  //   const options = {
  //     headers: headers,
  //     params: params
  //   };
  //   const normalizePath = toPersianAndCastBooleanChars(path);
  //   return this.http
  //     .get(`${environment.apiUrl}${environment.odataEndpoint}${normalizePath}`, options)
  //     .pipe(catchError(this.formatErrors))
  //     .toPromise();
  // }
}
