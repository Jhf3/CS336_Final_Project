import { Component, OnInit, OnDestroy, ChangeDetectorRef, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SessionListComponent } from '../../components/session-list/session-list.component';
import { Navbar, NavButton } from '../../components/navbar/navbar';
import { DatabaseService } from '../../services/database-service';
import { Group, User, Session, CreateSessionRequest } from '../../../../types/types';
import { Subscription } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SessionListComponent, Navbar, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  
  // User and group data
  currentUser: User | null = null;
  selectedGroup: Group | null = null;
  
  // Sessions data
  upcomingSessions: Session[] = [];
  isLoadingSessions: boolean = true;
  errorMessage: string = '';
  
  // New session form
  showNewSessionModal: boolean = false;
  newSessionDate: string = '';
  newSessionTime: string = '';
  newSessionNotes: string = '';
  isCreatingSession: boolean = false;
  sessionCreationError: string = '';
  
  // Subscription management
  private sessionsSubscription: Subscription | null = null;
  
  get navigationButtons(): NavButton[] {
    const buttons: NavButton[] = [];
    
    // Only show New Session button if user is the host
    if (this.isUserHost()) {
      buttons.push({ label: 'New Session', action: () => this.openNewSessionModal(), style: 'primary', icon: '➕' });
    }
    
    buttons.push(
      { label: 'Manage Groups', route: '/groups', style: 'secondary' },
      { label: 'Campaign History', route: '/campaign-history', style: 'secondary' },
      { label: 'Debug', route: '/debug', style: 'secondary' }
    );
    
    return buttons;
  }
  
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
      console.log('Loaded selected group:', this.selectedGroup);
    } else {
      console.log('No selected group found in localStorage');
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
          console.error('Group ID:', this.selectedGroup?.id);
          console.error('Error details:', error.code, error.message);
          
          let errorMsg = 'Failed to load sessions.';
          if (error.code === 'permission-denied') {
            errorMsg += ' Check Firestore security rules.';
          } else if (error.code === 'unavailable') {
            errorMsg += ' Check your internet connection.';
          } else {
            errorMsg += ' Please try again or check the console for details.';
          }
          
          this.errorMessage = errorMsg;
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
  
  isUserHost(): boolean {
    if (!this.currentUser || !this.selectedGroup) {
      return false;
    }
    return this.selectedGroup.hostId === this.currentUser.id;
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

  // ==================== NEW SESSION MODAL METHODS ====================

  /**
   * Open the new session modal
   */
  openNewSessionModal() {
    if (!this.hasSelectedGroup()) {
      this.errorMessage = 'Please select a group first before creating a session.';
      this.cdr.detectChanges(); // Force change detection for error message
      return;
    }
    
    if (!this.isUserHost()) {
      this.errorMessage = 'Only the group host can create sessions.';
      this.cdr.detectChanges();
      return;
    }
    
    // Reset form
    this.newSessionDate = '';
    this.newSessionTime = '';
    this.newSessionNotes = '';
    this.sessionCreationError = '';
    this.isCreatingSession = false;
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.newSessionDate = tomorrow.toISOString().split('T')[0];
    
    // Set default time to 7 PM
    this.newSessionTime = '19:00';
    
    this.showNewSessionModal = true;
    this.cdr.detectChanges(); // Force change detection when opening modal
  }

  /**
   * Close the new session modal
   */
  closeNewSessionModal() {
    this.showNewSessionModal = false;
    this.sessionCreationError = '';
    this.cdr.detectChanges(); // Force change detection when closing modal
  }

  /**
   * Create a new session using the form data
   */
  async createNewSession() {
    if (!this.selectedGroup || !this.currentUser) {
      this.sessionCreationError = 'Missing group or user information.';
      return;
    }

    if (!this.newSessionDate || !this.newSessionTime) {
      this.sessionCreationError = 'Please select both date and time for the session.';
      this.cdr.detectChanges(); // Force change detection for validation error
      return;
    }

    this.isCreatingSession = true;
    this.sessionCreationError = '';
    this.cdr.detectChanges(); // Force change detection when starting creation

    try {
      // Combine date and time into a single timestamp
      const dateTimeString = `${this.newSessionDate}T${this.newSessionTime}:00`;
      const sessionDateTime = new Date(dateTimeString);
      
      // Check if the session is in the future
      if (sessionDateTime <= new Date()) {
        this.sessionCreationError = 'Session date and time must be in the future.';
        this.isCreatingSession = false;
        this.cdr.detectChanges(); // Force change detection for date validation error
        return;
      }

      const createSessionRequest: CreateSessionRequest = {
        groupId: this.selectedGroup.id,
        sessionDate: Timestamp.fromDate(sessionDateTime),
        hostNotes: this.newSessionNotes.trim(),
        isConfirmed: false, // New sessions start as unconfirmed
        availableUsers: [], // Empty initially, users can confirm later
        snacks: [],
        carpool: []
      };

      console.log('Creating session with request:', createSessionRequest);
      
      const result = await this.dbService.createSession(createSessionRequest);
      
      if (result.success) {
        console.log('Session created successfully:', result.data);
        this.closeNewSessionModal();
        
        // Show success message briefly
        this.errorMessage = '';
        this.cdr.detectChanges(); // Force change detection for success state
        // The real-time stream will automatically update the sessions list
      } else {
        console.error('Failed to create session:', result.error);
        this.sessionCreationError = result.error.message || 'Failed to create session. Please try again.';
        this.cdr.detectChanges(); // Force change detection for creation error
      }
    } catch (error) {
      console.error('Error creating session:', error);
      this.sessionCreationError = 'An error occurred while creating the session. Please try again.';
      this.cdr.detectChanges(); // Force change detection for exception error
    } finally {
      this.isCreatingSession = false;
      this.cdr.detectChanges(); // Force change detection when ending creation
    }
  }

  /**
   * Get minimum date for session date picker (tomorrow)
   */
  getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
}