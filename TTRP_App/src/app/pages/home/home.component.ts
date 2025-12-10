import { Component, OnInit, OnDestroy, ChangeDetectorRef, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { SessionListComponent, SessionData } from '../../components/session-list/session-list.component';
import { Navbar, NavButton } from '../../components/navbar/navbar';
import { DatabaseService } from '../../services/database-service';
import { Group, User, Session } from '../../../../types/types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SessionListComponent, Navbar, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  
  navigationButtons: NavButton[] = [
    { label: 'Manage Groups', route: '/groups', style: 'primary' },
    { label: 'Campaign History', route: '/campaign-history', style: 'secondary' },
    { label: 'Debug', route: '/debug', style: 'secondary' }
  ];

  // User and group data
  currentUser: User | null = null;
  selectedGroup: Group | null = null;
  
  // Sessions data
  upcomingSessions: SessionData[] = [];
  isLoadingSessions: boolean = true;
  errorMessage: string = '';
  
  // Subscription management
  private sessionsSubscription: Subscription | null = null;
  
  constructor(
    private dbService: DatabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  
  async ngOnInit() {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoadingSessions = false;
      return;
    }
    
    await this.loadUserAndGroup();
    if (this.selectedGroup) {
      this.setupSessionsStream();
    } else {
      this.isLoadingSessions = false;
    }
  }
  
  ngOnDestroy() {
    if (this.sessionsSubscription) {
      this.sessionsSubscription.unsubscribe();
    }
  }
  
  private async loadUserAndGroup() {
    // Ensure we're in browser environment before accessing localStorage
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Load current user
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = JSON.parse(storedUser);
    
    // Load selected group
    const storedGroup = localStorage.getItem('selectedGroup');
    if (storedGroup) {
      this.selectedGroup = JSON.parse(storedGroup);
    }
  }
  
  setupSessionsStream() {
    if (!this.selectedGroup) return;
    
    this.isLoadingSessions = true;
    this.errorMessage = '';
    this.cdr.detectChanges(); // Force change detection when starting load
    
    // Subscribe to real-time sessions stream for the selected group
    this.sessionsSubscription = this.dbService.getGroupSessionsStream(this.selectedGroup.id)
      .subscribe({
        next: (sessions: Session[]) => {
          this.upcomingSessions = this.convertSessionsToSessionData(sessions);
          this.isLoadingSessions = false;
          this.cdr.detectChanges(); // Force change detection after data update
        },
        error: (error) => {
          console.error('Error loading sessions stream:', error);
          this.errorMessage = 'Failed to load sessions';
          this.isLoadingSessions = false;
          this.upcomingSessions = [];
          this.cdr.detectChanges(); // Force change detection on error
        }
      });
  }
  
  private convertSessionsToSessionData(sessions: Session[]): SessionData[] {
    // Filter for upcoming sessions (future dates only)
    const now = new Date();
    const upcomingSessions = sessions.filter(session => 
      session.sessionDate.toDate() >= now
    );
    
    // Convert Session objects to SessionData format
    return upcomingSessions.map(session => ({
      date: session.sessionDate.toDate(),
      availablePlayers: this.generatePlayerList(session)
    }));
  }
  
  private generatePlayerList(session: Session): string[] {
    // For now, generate a placeholder list of players
    // In a real app, you might fetch group members or session participants
    if (!this.selectedGroup) return [];
    
    const memberCount = this.selectedGroup.memberIds.length;
    const playerNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace'];
    
    // Return a subset of player names based on group size
    return playerNames.slice(0, Math.min(memberCount, playerNames.length));
  }
  
  getSelectedGroupName(): string {
    return this.selectedGroup ? this.selectedGroup.name : 'No Group Selected';
  }
  
  hasSelectedGroup(): boolean {
    return this.selectedGroup !== null;
  }
}