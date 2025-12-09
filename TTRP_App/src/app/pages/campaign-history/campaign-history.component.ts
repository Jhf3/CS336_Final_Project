import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SessionListComponent, SessionData } from '../../components/session-list/session-list.component';

@Component({
  selector: 'app-campaign-history',
  imports: [CommonModule, RouterLink, SessionListComponent],
  templateUrl: './campaign-history.component.html',
  styleUrl: './campaign-history.component.css'
})
export class CampaignHistoryComponent {
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
