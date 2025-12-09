import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CampaignHistoryComponent } from './pages/campaign-history/campaign-history.component';
import { DebugComponent } from './pages/debug/debug.component';
import { TestingComponent } from './pages/testing/testing.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'campaign-history', component: CampaignHistoryComponent },
  { path: 'debug', component: DebugComponent },
  { path: 'testing', component: TestingComponent },
  { path: '**', redirectTo: '' }
];
