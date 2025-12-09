import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionListComponent, SessionData } from '../../components/session-list/session-list.component';
import { Navbar, NavButton } from '../../components/navbar/navbar';

@Component({
  selector: 'app-home',
  imports: [CommonModule, SessionListComponent, Navbar],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  navigationButtons: NavButton[] = [
    { label: 'Groups', route: '', disabled: true, style: 'primary' },
    { label: 'Campaign History', route: '/campaign-history', style: 'secondary' },
    { label: 'Debug', route: '/debug', style: 'secondary' }
  ];

  // Upcoming sessions for the next 1-2 weeks
  upcomingSessions: SessionData[] = [
    {
      date: new Date('2025-12-15'),
      availablePlayers: ['Alice', 'Bob', 'Charlie', 'Diana']
    },
    {
      date: new Date('2025-12-22'),
      availablePlayers: ['Alice', 'Bob', 'Eve']
    }
  ];
}