import {Component, EventEmitter, Output} from '@angular/core';
import {DatePipe} from '@angular/common';
import {printDataModel} from './print-data.model';
import {PrintDataService} from './print-data.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-print-data',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './print-data.component.html',
  styleUrl: './print-data.component.css'
})
export class PrintDataComponent {
  data: printDataModel = {
    fname: '',
    lname: '',
    fatherName: '',
    nationalCode: '',
    phoneNumber: '',
    email: '',
    photo: null
  };

  today = new Date();
  @Output() nextStep4 = new EventEmitter<void>();

  constructor(
    private printService: PrintDataService) {
  }

  ngOnInit() {
    this.printService.fullData$.subscribe((data: printDataModel) => {
      this.data = data;
    });
  }

  print() {
    window.print();
  }
}
