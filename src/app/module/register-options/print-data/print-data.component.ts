import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {printDataModel} from './print-data.model';
import {PrintDataService} from './print-data.service';

@Component({
  selector: 'app-print-data',
  standalone: true,
  imports: [
    CommonModule
  ],
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
