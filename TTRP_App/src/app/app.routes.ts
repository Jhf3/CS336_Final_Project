import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DebugComponent } from './pages/debug/debug.component';
import { TestingComponent } from './pages/testing/testing.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'debug', component: DebugComponent },
  { path: 'testing', component: TestingComponent },
  { path: '**', redirectTo: '' }
];
