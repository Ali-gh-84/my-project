import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { printDataModel } from './print-data.model';

@Injectable({
  providedIn: 'root'
})
export class PrintDataService {

  private userInfo = new BehaviorSubject<Partial<printDataModel>>({});
  private userPhoto = new BehaviorSubject<string | null>(null);

  readonly fullData$ = combineLatest([
    this.userInfo,
    this.userPhoto
  ]).pipe(
    map(([info, photo]) => ({
      name: info.name || '',
      family: info.family || '',
      fatherName: info.fatherName || '',
      nationalCode: info.nationalCode || '',
      phoneNumber: info.phoneNumber || '',
      email: info.email || '',
      photo: photo
    } as printDataModel))
  );

  updateUserInfo(info: Partial<printDataModel>) {
    this.userInfo.next({ ...this.userInfo.value, ...info });
  }

  updateUserPhoto(photoUrl: string | null) {
    this.userPhoto.next(photoUrl);
  }

  reset() {
    this.userInfo.next({});
    this.userPhoto.next(null);
  }
}
