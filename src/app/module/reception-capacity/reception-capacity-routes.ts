import {Routes} from '@angular/router';
import {ReceptionCapacityComponent} from './reception-capacity.component';

export const ReceptionCapacityRoutes: Routes = [
  {
    path: ':tenantId',
    component: ReceptionCapacityComponent,
  }
]
