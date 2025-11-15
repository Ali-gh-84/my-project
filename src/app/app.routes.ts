import {Routes} from '@angular/router';
import {MainPageComponent} from './module/mainpagecomponent/main-page.component';
import {WizardComponent} from './module/wizard/wizard.component';
import {LoginComponent} from './module/login/login.component';
import {UserProfileComponent} from './module/user-profile/user-profile.component';
import {ForgetSerialComponent} from './module/forget-serial/forget-serial.component';

export const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
  },
  {
    path: 'register',
    component: WizardComponent
  },
  {
    path: 'personal-info',
    component: LoginComponent
  },
  {
    path: 'info',
    component: UserProfileComponent
  },
  {
    path: 'serial',
    component: ForgetSerialComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
