import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AgGridAngular } from "ag-grid-angular";
import { ColDef } from "ag-grid-community";

interface IRow {
  make: string;
  model: string;
  price: number;
  electric: boolean;
}

@Component({
  standalone: true,
  selector: "my-app",
  imports: [CommonModule, AgGridAngular],
  template: `
    <div style="width: 100%; height: 100%;">
      <ag-grid-angular
        style="width: 100%; height: 300px;"
        class="ag-theme-alpine"
        [rowData]="rowData"
        [columnDefs]="colDefs"
        [defaultColDef]="defaultColDef">
      </ag-grid-angular>
    </div>
  `,
})
export class ReceptionCapacityComponent {
  rowData: IRow[] = [
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
    { make: "Ford", model: "F-Series", price: 33850, electric: false },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    { make: "Mercedes", model: "EQA", price: 48890, electric: true },
    { make: "Fiat", model: "500", price: 15774, electric: false },
    { make: "Nissan", model: "Juke", price: 20675, electric: false },
  ];

  colDefs: ColDef[] = [
    { field: "make" },
    { field: "model" },
    { field: "price" },
    { field: "electric" },
  ];

  defaultColDef: ColDef = {
    flex: 1,
  };
}
