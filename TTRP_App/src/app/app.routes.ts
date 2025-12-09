import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CampaignHistoryComponent } from './pages/campaign-history/campaign-history.component';
import { DebugComponent } from './pages/debug/debug.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent},
  { path: 'campaign-history', component: CampaignHistoryComponent },
  { path: 'debug', component: DebugComponent },
  { path: '**', redirectTo: '/login' }
];
