import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionListComponent } from '../../components/session-list/session-list.component';
import { Session } from '../../../../types/types';
import { Timestamp } from '@angular/fire/firestore';
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
  pastSessions: Session[] = [
    {
      id: 'past-session-1',
      groupId: 'test-group-1',
      groupName: 'Weekly D&D Campaign',
      hostId: 'test-host-1',
      hostName: 'John Doe',
      isConfirmed: true,
      sessionDate: Timestamp.fromDate(new Date('2025-11-24')),
      hostNotes: 'Successfully defeated the dragon and saved the village.',
      availableUsers: ['user1', 'user2', 'user3', 'user4', 'user5'],
      snacks: [{ userId: 'user2', userName: 'Alice', snackDescription: 'Victory pizza!' }],
      carpool: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      id: 'past-session-2', 
      groupId: 'test-group-1',
      groupName: 'Weekly D&D Campaign',
      hostId: 'test-host-1',
      hostName: 'John Doe',
      isConfirmed: true,
      sessionDate: Timestamp.fromDate(new Date('2025-11-17')),
      hostNotes: 'Explored the ancient library and found important clues.',
      availableUsers: ['user1', 'user2', 'user3', 'user4'],
      snacks: [],
      carpool: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      id: 'past-session-3',
      groupId: 'test-group-1',
      groupName: 'Weekly D&D Campaign',
      hostId: 'test-host-1',
      hostName: 'John Doe',
      isConfirmed: true,
      sessionDate: Timestamp.fromDate(new Date('2025-11-10')),
      hostNotes: 'Epic battle in the underground caverns.',
      availableUsers: ['user2', 'user3', 'user4', 'user5'],
      snacks: [{ userId: 'user4', userName: 'Charlie', snackDescription: 'Energy drinks!' }],
      carpool: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
  ];
}
