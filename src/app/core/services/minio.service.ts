import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MinioService {
  private pathUrl = '/services/app/RegisterApplicant';
  private loadingStates = new Map<string, boolean>();

  constructor(private apiService: ApiService) {}

  upload(files: File[], folderName: string, tenantId: number): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file, file.name));
    formData.append('FolderName', folderName);
    return this.apiService.post(`${this.pathUrl}/Upload?tenantId=${tenantId}`, formData);
  }

  download(key: string): void {
    this.apiService.get(`${this.pathUrl}/GetDownloadUrl/${key}`).subscribe((res: any) => {
      window.open(res.result || res, '_blank');
    });
  }

  deleteFiles(paths: string[]): Observable<any> {
    const query = paths.map(p => `paths=${encodeURIComponent(p)}`).join('&');
    return this.apiService.delete(`/Media/delete?${query}`);
  }

  setLoading(controlPath: string, loading: boolean): void {
    this.loadingStates.set(controlPath, loading);
  }

  isLoading(controlPath: string): boolean {
    return this.loadingStates.get(controlPath) || false;
  }
}
