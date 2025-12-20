import {Routes} from '@angular/router';
import {UserProfileComponent} from './user-profile.component';
// import {loginGuard} from '../../core/guards/login.guard';

export const UserProfileRoutes: Routes = [
  {
    path: ':tenantId',
    component: UserProfileComponent,
    // canActivate: [loginGuard],
  }
]

