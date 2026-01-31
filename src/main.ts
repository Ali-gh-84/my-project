import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';

import {ModuleRegistry} from 'ag-grid-community';
import {AllCommunityModule} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));


