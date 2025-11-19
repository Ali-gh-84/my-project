import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

// import { bootstrapApplication } from '@angular/platform-browser';
// import { AppComponent } from './app/app.component';
//
// import { ModuleRegistry } from 'ag-grid-community';
//
// import { ClientSideRowModelModule } from 'ag-grid-community';
// import {MenuModule} from 'ag-grid-enterprise';
//
// // ثبت ماژول‌ها - بدون AllCommunityModule
// ModuleRegistry.registerModules([
//   ClientSideRowModelModule,
// ]);
// bootstrapApplication(AppComponent, {
//   providers: [
//   ]
// }).catch(err => console.error(err));



