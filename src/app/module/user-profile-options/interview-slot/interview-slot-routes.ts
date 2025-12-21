import {Routes} from '@angular/router';
import {InterviewSlotComponent} from './interview-slot.component';
import {loginGuard} from '../../../core/guards/login.guard';

export const InterviewSlotRoutes: Routes = [
  {
    path: ':tenantId',
    component: InterviewSlotComponent,
    canActivate: [loginGuard],
  }
]

