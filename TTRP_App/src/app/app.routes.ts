import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DebugComponent } from './pages/debug/debug.component';
import { TestingComponent } from './pages/testing/testing.component';
import { LoginPageComponent } from './pages/login/login-page.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'debug', component: DebugComponent },
  { path: 'testing', component: TestingComponent },
  { path: '**', redirectTo: '' }
];
