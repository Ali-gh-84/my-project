import { Component } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';

export interface Car {
  name: string;
  email: string;
  age: number;
  active: boolean;
}

@Component({
  standalone: true,
  selector: 'app-reception-capacity',
  templateUrl: './reception-capacity.component.html',
  styleUrls: ['./reception-capacity.component.css'],
  imports: [CommonModule, NzTableModule]
})
export class ReceptionCapacityComponent {

  cars: Car[] = [
    { name: 'علی علی اکبرزاده', email: 'ali@gmail.com', age: 20, active: false },
    { name: 'علی ملایی', email: 'aliaam@gmail.com', age: 19, active: true },
    { name: 'حمید جعفری', email: 'hamid@gmail.com', age: 21, active: false },
    { name: 'سید محمد میرهاشمی', email: 'mmdghoon@gmail.com', age: 25, active: true }
  ];

  pageSize = 5;
  pageIndex = 1;
  total = this.cars.length;

  sortKey!: string;
  sortOrder: 'ascend' | 'descend' | null = null;

  onSort(sort: { key: string; value: 'ascend' | 'descend' | null }) {
    this.sortKey = sort.key;
    this.sortOrder = sort.value;

    if (this.sortKey && this.sortOrder) {
      this.cars = [...this.cars.sort((a: any, b: any) =>
        this.sortOrder === 'ascend'
          ? a[this.sortKey] > b[this.sortKey] ? 1 : -1
          : b[this.sortKey] > a[this.sortKey] ? 1 : -1
      )];
    }
  }
}
