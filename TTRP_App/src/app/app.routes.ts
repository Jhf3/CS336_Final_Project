import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DebugComponent } from './debug/debug.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'debug', component: DebugComponent },
  { path: '**', redirectTo: '' }
];
