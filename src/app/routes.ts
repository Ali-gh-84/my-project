import {Routes} from "@angular/router";
import {MainPageComponent} from "./module/mainpagecomponent/main-page.component";

export const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
  },
  {
    path: 'register',
    loadChildren: () =>
      import('../app/module/wizard/wizard-routes').then(m => m.WizardRoutes)
  },
  {
    path: 'personal-info',
    loadChildren: () =>
      import('../app/module/login/login-routes').then(m => m.LoginRoutes)
  },
  {
    path: 'info',
    loadChildren: () =>
      import('../app/module/user-profile/user-profile-routes').then(m => m.UserProfileRoutes)
  },
  {
    path: 'capacity',
    loadChildren: () =>
      import('../app/module/reception-capacity/reception-capacity-routes').then(m => m.ReceptionCapacityRoutes)
  },
  {
    path: 'serial',
    loadChildren: () =>
      import('../app/module/forget-serial/forget-serial-routes').then(m => m.ForgetSerialRoutes)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

