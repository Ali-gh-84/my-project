import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MainPageComponent} from './module/mainpagecomponent/main-page.component';
import {WizardComponent} from './module/wizard/wizard.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MainPageComponent, WizardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'register-whc';
}
