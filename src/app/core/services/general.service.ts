import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {map} from 'rxjs/operators';
import {shareReplay} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  key = 'description';
  value = 'name';
  dataAll: any = []

  constructor(private apiService: ApiService) {}

  GetEnumsDetail(body: Array<string>,cache:boolean = true) {
    // if (cache){
    //   const url =`/General/GetEnumsDetail?EnumNames=${body}`
    //   const existingData = this.dataAll.find((item: any) => item.id === url);
    //   if (existingData && existingData.data.id === url) {
    //     return existingData.data.data;
    //   }
    //   const dataEventRoadMap = this.apiService.get(url).pipe(shareReplay(1),map(data => data.result));
    //   const newData = {id: url, data: dataEventRoadMap, name: url};
    //   this.dataAll.push({data: newData, id: url});
    //   return dataEventRoadMap;
    // }else {
    return this.apiService.get('/General/GetEnumsDetail', {'EnumNames': body}).pipe(map(data => data.result))

    // }

  }

  getSubSystems() {
    return this.apiService.get('/General/GetSubSystems').pipe(map(data => data.result));
  }
}
