import {Routes} from '@angular/router';
import {WizardComponent} from './wizard.component';

export const WizardRoutes: Routes = [
  {
    path: ':tenantId',
    component: WizardComponent,
  }
]

