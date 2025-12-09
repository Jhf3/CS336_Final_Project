import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DebugComponent } from './pages/debug/debug.component';
import { TestingComponent } from './pages/home/testing/testing.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'debug', component: DebugComponent },
  { path: 'testing', component: TestingComponent },
  { path: '**', redirectTo: '' }
];
