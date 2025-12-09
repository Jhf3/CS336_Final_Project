import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionListComponent, SessionData } from '../../components/session-list/session-list.component';
import { Navbar, NavButton } from '../../components/navbar/navbar';

@Component({
  selector: 'app-campaign-history',
  imports: [CommonModule, SessionListComponent, Navbar],
  templateUrl: './campaign-history.component.html',
  styleUrl: './campaign-history.component.css'
})
export class CampaignHistoryComponent {
  navigationButtons: NavButton[] = [
    { label: 'Upcoming Sessions', route: '/', style: 'primary' }
  ];

  // Previous sessions
  pastSessions: SessionData[] = [
    {
      date: new Date('2025-11-24'),
      availablePlayers: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']
    },
    {
      date: new Date('2025-11-17'),
      availablePlayers: ['Alice', 'Bob', 'Charlie', 'Diana']
    },
    {
      date: new Date('2025-11-10'),
      availablePlayers: ['Bob', 'Charlie', 'Diana', 'Eve']
    },
    {
      date: new Date('2025-11-03'),
      availablePlayers: ['Alice', 'Charlie', 'Diana', 'Eve']
    },
    {
      date: new Date('2025-10-27'),
      availablePlayers: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']
    }
  ];
}
