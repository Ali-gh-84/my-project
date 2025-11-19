import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ReceptionCapacityComponent} from './module/reception-capacity/reception-capacity.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'register-whc';
}
