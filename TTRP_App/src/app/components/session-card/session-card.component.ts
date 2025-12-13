import { Component, Input, Output, EventEmitter, PLATFORM_ID, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DetailedSessionCardComponent } from '../detailed-session-card/detailed-session-card.component';
import { Session, User } from '../../../../types/types';
import { DatabaseService } from '../../services/database-service';

@Component({
  selector: 'app-session-card',
  imports: [CommonModule, DetailedSessionCardComponent],
  templateUrl: './session-card.component.html',
  styleUrl: './session-card.component.css'
})
export class SessionCardComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  
  @Input() session!: Session;
  @Output() sessionUpdated = new EventEmitter<Session>();
  
  showModal = false;
  currentUser: User | null = null;
  
  constructor(private dbService: DatabaseService) {}

  get isDM(): boolean {
    if (!this.currentUser) return false;
    return this.session.hostId === this.currentUser.id;
  }

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
    return this.session.externalAvailability || '';
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
    // Only return secret notes if current user is the host
    if (!this.currentUser || this.session.hostId !== this.currentUser.id) {
      return '';
    }
    return this.session.secretNotes || '';
  }
  
  openModal() {
    this.showModal = true;
  }
  
  closeModal() {
    this.showModal = false;
  }
  
  onSessionUpdated(updatedSession: Session) {
    // Update local session data
    this.session = updatedSession;
    // Emit to parent component
    this.sessionUpdated.emit(updatedSession);
  }
}
