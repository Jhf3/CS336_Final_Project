import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SessionListComponent, SessionData } from '../../components/session-list/session-list.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, SessionListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
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