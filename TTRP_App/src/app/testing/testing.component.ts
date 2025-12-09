import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionListComponent, SessionData } from '../components/session-list/session-list.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-testing',
  imports: [CommonModule, SessionListComponent, RouterLink],
  templateUrl: './testing.component.html',
  styleUrl: './testing.component.css'
})
export class TestingComponent {
  // Filler session data
  sessions: SessionData[] = [
    {
      date: new Date('2025-12-15'),
      availablePlayers: ['Alice', 'Bob', 'Charlie', 'Diana']
    },
    {
      date: new Date('2025-12-22'),
      availablePlayers: ['Alice', 'Bob', 'Eve']
    },
    {
      date: new Date('2025-12-29'),
      availablePlayers: ['Bob', 'Charlie', 'Diana', 'Eve', 'Frank']
    },
    {
      date: new Date('2026-01-05'),
      availablePlayers: ['Alice', 'Charlie', 'Diana']
    },
    {
      date: new Date('2026-01-12'),
      availablePlayers: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']
    }
  ];

  // Filler note data
  noteSessionDate = new Date('2025-11-24');
  noteSynopsis = 'The party ventured into the ancient ruins beneath the city. They discovered mysterious runes and encountered a group of goblins guarding a sealed door. After a fierce battle, they found a magical key that may unlock deeper secrets.';

  // Filler secret note data
  secretNotes = `Plot Hook: The sealed door leads to an ancient vault containing a powerful artifact.
  
NPCs to introduce:
- Mysterious hooded figure watching from shadows
- Ancient spirit bound to the vault

Future Events:
- The goblins were sent by a dark wizard
- The artifact is one of five needed to prevent a catastrophe
- A rival adventuring party is also seeking the artifacts`;
}
