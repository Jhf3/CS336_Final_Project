import { Component, OnInit, OnDestroy, ChangeDetectorRef, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SessionListComponent } from '../../components/session-list/session-list.component';
import { Session, Group, User } from '../../../../types/types';
import { DatabaseService } from '../../services/database-service';
import { Navbar, NavButton } from '../../components/navbar/navbar';

@Component({
  selector: 'app-campaign-history',
  imports: [CommonModule, SessionListComponent, Navbar],
  templateUrl: './campaign-history.component.html',
  styleUrl: './campaign-history.component.css'
})
export class CampaignHistoryComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  
  navigationButtons: NavButton[] = [
    { label: 'Campaign Home', route: '/home', style: 'primary' }
  ];

  // User and group data
  currentUser: User | null = null;
  selectedGroup: Group | null = null;
  
  // Sessions data
  pastSessions: Session[] = [];
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
      this.setupPastSessionsStream();
    } else {
      this.isLoadingSessions = false;
      this.errorMessage = 'No group selected. Please select a group from the Groups page.';
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
      console.log('Loaded selected group for campaign history:', this.selectedGroup);
    } else {
      console.log('No selected group found in localStorage');
    }
  }
  
  setupPastSessionsStream() {
    if (!this.selectedGroup) return;
    
    this.isLoadingSessions = true;
    this.errorMessage = '';
    this.cdr.detectChanges(); // Force change detection when starting load
    
    // Subscribe to real-time sessions stream for the selected group
    this.sessionsSubscription = this.dbService.getGroupSessionsStream(this.selectedGroup.id)
      .subscribe({
        next: (sessions: Session[]) => {
          console.log('All sessions loaded for campaign history:', sessions);
          this.pastSessions = this.filterPastSessions(sessions);
          this.isLoadingSessions = false;
          this.errorMessage = '';
          this.cdr.detectChanges(); // Force change detection after data update
        },
        error: (error) => {
          console.error('Error loading past sessions stream:', error);
          console.error('Group ID:', this.selectedGroup?.id);
          console.error('Error details:', error.code, error.message);
          
          let errorMsg = 'Failed to load campaign history.';
          if (error.code === 'permission-denied') {
            errorMsg += ' Check Firestore security rules.';
          } else if (error.code === 'unavailable') {
            errorMsg += ' Check your internet connection.';
          } else {
            errorMsg += ' Please try again or check the console for details.';
          }
          
          this.errorMessage = errorMsg;
          this.isLoadingSessions = false;
          this.pastSessions = [];
          this.cdr.detectChanges(); // Force change detection on error
        }
      });
  }
  
  private filterPastSessions(sessions: Session[]): Session[] {
    try {
      // Filter for past sessions (sessions before current date) and sort by most recent
      const now = new Date();
      return sessions
        .filter(session => {
          // Defensive check for sessionDate
          if (!session || !session.sessionDate) {
            console.warn('Session missing sessionDate:', session);
            return false;
          }
          
          try {
            return session.sessionDate.toDate() < now;
          } catch (error) {
            console.error('Error converting sessionDate:', error, session);
            return false;
          }
        })
        .sort((a, b) => b.sessionDate.toDate().getTime() - a.sessionDate.toDate().getTime());
    } catch (error) {
      console.error('Error filtering past sessions:', error);
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
      this.cdr.detectChanges(); // Force change detection when clearing error
      this.setupPastSessionsStream();
    }
  }
  
  /**
   * Navigate to groups page - can be called from template
   */
  navigateToGroups() {
    this.router.navigate(['/groups']);
  }
}

