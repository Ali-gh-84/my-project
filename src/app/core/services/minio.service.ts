// minio.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MinioService {
  private baseUrl = '/Media';
  private loadingStates = new Map<string, boolean>();

  constructor(private apiService: ApiService) {}

  upload(files: File[], folderName: string): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file, file.name));
    formData.append('FolderName', folderName);
    return this.apiService.post(`${this.baseUrl}/Upload`, formData);
  }

  download(key: string): void {
    this.apiService.get(`${this.baseUrl}/GetDownloadUrl/${key}`).subscribe((res: any) => {
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
