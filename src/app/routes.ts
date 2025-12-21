import {Routes} from "@angular/router";
import {MainPageComponent} from "./module/mainpagecomponent/main-page.component";
import {UserProfileComponent} from './module/user-profile/user-profile.component';
import {loginGuard} from './core/guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
  },
  {
    path: 'register',
    loadChildren: () =>
      import('../app/module/wizard/wizard-routes').then(m => m.WizardRoutes),
    canActivate: [loginGuard]
  },
  // {
  //   path: 'personal-info',
  //   loadChildren: () =>
  //     import('../app/module/login/login-routes').then(m => m.LoginRoutes),
  //   // canActivate: [loginGuard]
  // },
  {
    path: 'info',
    loadChildren: () =>
      import('../app/module/user-profile/user-profile-routes').then(m => m.UserProfileRoutes),
    canActivate: [loginGuard]
  },
  {
    path: 'capacity',
    loadChildren: () =>
      import('../app/module/reception-capacity/reception-capacity-routes').then(m => m.ReceptionCapacityRoutes),
    canActivate: [loginGuard]
  },
  {
    path: 'serial',
    loadChildren: () =>
      import('../app/module/forget-serial/forget-serial-routes').then(m => m.ForgetSerialRoutes),
    canActivate: [loginGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

