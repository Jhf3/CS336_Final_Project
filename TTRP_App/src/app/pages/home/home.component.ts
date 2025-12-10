import { Component, OnInit, OnDestroy, ChangeDetectorRef, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { SessionListComponent } from '../../components/session-list/session-list.component';
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
  upcomingSessions: Session[] = [];
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
          console.log('Sessions loaded successfully:', sessions);
          this.upcomingSessions = this.filterUpcomingSessions(sessions);
          this.isLoadingSessions = false;
          this.errorMessage = ''; // Clear any previous error message
          this.cdr.detectChanges(); // Force change detection after data update
        },
        error: (error) => {
          console.error('Error loading sessions stream:', error);
          this.errorMessage = 'Failed to load sessions. Please check your connection and try again.';
          this.isLoadingSessions = false;
          this.upcomingSessions = [];
          this.cdr.detectChanges(); // Force change detection on error
        }
      });
  }
  
  private filterUpcomingSessions(sessions: Session[]): Session[] {
    try {
      // Filter for upcoming sessions (future dates only)
      const now = new Date();
      return sessions.filter(session => {
        // Defensive check for sessionDate
        if (!session || !session.sessionDate) {
          console.warn('Session missing sessionDate:', session);
          return false;
        }
        
        try {
          return session.sessionDate.toDate() >= now;
        } catch (error) {
          console.error('Error converting sessionDate:', error, session);
          return false;
        }
      });
    } catch (error) {
      console.error('Error filtering sessions:', error);
      return [];
    }
  }
  

  
  getSelectedGroupName(): string {
    return this.selectedGroup ? this.selectedGroup.name : 'No Group Selected';
  }
  
  hasSelectedGroup(): boolean {
    return this.selectedGroup !== null;
  }
  
  /**
   * Public method to retry loading sessions - can be called from template
   */
  retryLoadingSessions() {
    if (this.selectedGroup) {
      // Unsubscribe from existing stream if any
      if (this.sessionsSubscription) {
        this.sessionsSubscription.unsubscribe();
      }
      
      this.errorMessage = '';
      this.setupSessionsStream();
    }
  }
}