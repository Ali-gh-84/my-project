import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AgGridAngular } from 'ag-grid-angular'; // ایمپورت کامپوننت گرید
import { ColDef } from 'ag-grid-community'; //

interface IRow {
  make: string;
  model: string;
  price: number;
  electric: boolean;
}

@Component({
  standalone: true,
  selector: "app-reception-capacity",
  imports: [CommonModule, AgGridAngular],
  templateUrl: './reception-capacity.component.html',
})
export class ReceptionCapacityComponent {
  rowData: IRow[] = [  // type اضافه کن
    { make: 'Toyota', model: 'Celica', price: 35000, electric: false },
    { make: 'Ford', model: 'Mondeo', price: 32000, electric: false },
    { make: 'Porsche', model: 'Boxster', price: 72000, electric: false },
    { make: 'BMW', model: '5 Series', price: 59000, electric: true }
  ];

  columnDefs: ColDef<IRow>[] = [  // generic type اضافه کن (اختیاری)
    { field: 'make', headerName: 'Make', sortable: true, filter: true },
    { field: 'model', headerName: 'Model', sortable: true, filter: true },
    { field: 'price', headerName: 'Price', sortable: true, filter: 'agNumberColumnFilter' },
    { field: 'electric', headerName: 'Electric', sortable: true, filter: true }  // ستون اضافی برای تست
  ];

  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true
  };

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  private gridApi!: any;
  private gridColumnApi!: any;

  ngOnInit() {
    // اگر داده‌ها از API میان، اینجا لود کن (مثل this.loadData())
    console.log('Grid initialized');  // برای تست
  }

  // اختیاری: متد برای reload data
  private loadData() {
    // مثلاً this.rowData = await apiCall();
    this.gridApi?.setGridOption('rowData', this.rowData);
  }
}
