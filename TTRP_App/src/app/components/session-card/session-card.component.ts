import { Component, Input, Output, EventEmitter, PLATFORM_ID, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DetailedSessionCardComponent } from '../detailed-session-card/detailed-session-card.component';
import { Session, User } from '../../../../types/types';

@Component({
  selector: 'app-session-card',
  imports: [CommonModule, DetailedSessionCardComponent],
  templateUrl: './session-card.component.html',
  styleUrl: './session-card.component.css'
})
export class SessionCardComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  
  @Input() session!: Session;
  
  showModal = false;
  isDM = true;
  currentUser: User | null = null;

  ngOnInit() {
    // Load current user from localStorage
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
  }
  
  // Use actual session data instead of filler
  get detailedSnacks(): string {
    if (!this.session.snacks || this.session.snacks.length === 0) {
      return 'No snacks planned yet';
    }
    return this.session.snacks.map(snack => 
      `${snack.userName}: ${snack.snackDescription}`
    ).join(', ');
  }
  
  get detailedCarpool(): string {
    if (!this.session.carpool || this.session.carpool.length === 0) {
      return 'No carpool arranged yet';
    }
    return this.session.carpool.map(car => 
      `${car.driverName} (${car.passengers.length}/${car.capacity} passengers)`
    ).join(', ');
  }
  
  get detailedExternalAvailability(): string {
    return 'Game store reserved until 10 PM';
  }
  
  get availablePlayers(): string[] {
    // For display, we'll show the count of available users
    // In a real implementation, you might want to fetch actual usernames
    return this.session.availableUsers || [];
  }

  get sessionDate(): Date {
    return this.session.sessionDate.toDate();
  }

  get sessionSynopsis(): string {
    // Use actual host notes if available, otherwise show default message
    return this.session.hostNotes || 'No notes provided for this session.';
  }

  get sessionSynopsisLong(): string {
    if (this.session.hostNotes && this.session.hostNotes.length > 50) {
      return this.session.hostNotes;
    }
    const synopsisOptions = [
      'The party ventured into the ancient ruins beneath the city. They discovered mysterious runes and encountered a group of goblins guarding a sealed door. After a fierce battle, they found a magical key.',
      'Traveling through the Whispering Woods, the party encountered a wounded unicorn. They learned of a dark force corrupting the forest and pledged to help restore balance to nature.',
      'In the bustling port city of Saltmere, the party uncovered a smuggling ring and had to decide whether to report them to the authorities or negotiate a deal.',
      'The party descended into the depths of the Sunless Citadel, facing traps, monsters, and moral dilemmas as they searched for the fabled Tree of Life.',
      'A peaceful village feast was interrupted by an attack from the sky. The party defended the villagers and discovered clues pointing to an ancient dragon\'s return.'
    ];
    return synopsisOptions[this.sessionDate.getDate() % synopsisOptions.length];
  }
  
  get secretNotes(): string {
    const secretOptions = [
      `Plot Hook: The sealed door leads to an ancient vault containing a powerful artifact.\n\nNPCs to introduce:\n- Mysterious hooded figure watching from shadows\n- Ancient spirit bound to the vault\n\nFuture Events:\n- The goblins were sent by a dark wizard\n- The artifact is one of five needed to prevent a catastrophe`,
      `Hidden Details:\n- The unicorn is actually a cursed prince\n- The dark force is connected to the main villain\n- A druid circle knows more than they're sharing\n\nNext Session Setup:\n- Introduce the corrupted treant boss\n- Plant seeds about the Forest King's return`,
      `Secret Information:\n- The smugglers work for the Thieves' Guild\n- One smuggler is actually an undercover guard\n- There's a bigger conspiracy at play\n\nPlot Threads:\n- The stolen goods include a magical compass\n- A rival party is also investigating`,
      `DM Notes:\n- The tree contains souls of past adventurers\n- Main villain is watching from afar\n- One party member's backstory ties in here\n\nUpcoming Reveals:\n- The citadel was a prison, not a temple\n- Ancient evil is stirring beneath`,
      `Critical Info:\n- Dragon cult is behind the attack\n- Village elder knows ancient dragon lore\n- PC's family heirloom is dragon-related\n\nNext Steps:\n- Introduce dragon cultist NPC\n- Foreshadow dragon's lair location\n- Connect to main campaign arc`
    ];
    return secretOptions[this.sessionDate.getDate() % secretOptions.length];
  }
  
  openModal() {
    this.showModal = true;
  }
  
  closeModal() {
    this.showModal = false;
  }
}
