import { Component, Input, Output, EventEmitter, ChangeDetectorRef, PLATFORM_ID, inject, OnInit, OnChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteCardComponent } from '../note-card/note-card.component';
import { SecretNoteCardComponent } from '../secret-note-card/secret-note-card.component';
import { Session, User, UpdateSessionRequest } from '../../../../types/types';
import { DatabaseService } from '../../services/database-service';

@Component({
  selector: 'app-detailed-session-card',
  imports: [CommonModule, FormsModule, NoteCardComponent, SecretNoteCardComponent],
  templateUrl: './detailed-session-card.component.html',
  styleUrl: './detailed-session-card.component.css'
})
export class DetailedSessionCardComponent implements OnInit, OnChanges {
  private platformId = inject(PLATFORM_ID);
  
  @Input() session!: Session;
  @Input() snacks: string = '';
  @Input() carpool: string = '';
  @Input() externalAvailability: string = '';
  @Input() sessionSynopsis: string = '';
  @Input() secretNotes: string = '';
  @Input() isDM: boolean = false;
  @Input() currentUser: User | null = null;
  @Output() sessionUpdated = new EventEmitter<Session>();

  // Form inputs
  snackInput: string = '';
  carpoolInput: string = '';
  carpoolCapacity: number = 4;
  isProcessing: boolean = false;
  
  // Session confirmation state
  isUpdatingSession: boolean = false;
  updateError: string = '';

  // Host editing states
  isEditingHostNotes: boolean = false;
  isEditingSecretNotes: boolean = false;
  isEditingExternalAvailability: boolean = false;
  hostNotesInput: string = '';
  secretNotesInput: string = '';
  externalAvailabilityInput: string = '';

  // Player names data
  availablePlayerNames: string[] = [];
  isLoadingPlayerNames: boolean = false;

  constructor(
    private dbService: DatabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAvailablePlayerNames();
  }

  ngOnChanges() {
    // Reload player names when session changes
    this.loadAvailablePlayerNames();
  }

  /**
   * Load the names of users who have confirmed availability
   */
  private async loadAvailablePlayerNames() {
    if (!this.session?.availableUsers || this.session.availableUsers.length === 0) {
      this.availablePlayerNames = [];
      return;
    }

    this.isLoadingPlayerNames = true;
    this.cdr.detectChanges();

    try {
      const userNames: string[] = [];
      
      // Get user data for each available user ID
      for (const userId of this.session.availableUsers) {
        try {
          const userResult = await this.dbService.getUserById(userId);
          if (userResult.success && userResult.data) {
            userNames.push(userResult.data.username);
          } else {
            // If we can't find the user, show their ID as fallback
            userNames.push(`User ${userId.substring(0, 8)}...`);
          }
        } catch (error) {
          console.error(`Error loading user ${userId}:`, error);
          userNames.push(`User ${userId.substring(0, 8)}...`);
        }
      }

      this.availablePlayerNames = userNames;
    } catch (error) {
      console.error('Error loading available player names:', error);
      this.availablePlayerNames = this.session.availableUsers.map(id => `User ${id.substring(0, 8)}...`);
    } finally {
      this.isLoadingPlayerNames = false;
      this.cdr.detectChanges();
    }
  }

  private setProcessing(isProcessing: boolean) {
    this.isProcessing = isProcessing;
    this.cdr.detectChanges();
  }

  private setUpdatingSession(isUpdating: boolean) {
    this.isUpdatingSession = isUpdating;
    this.cdr.detectChanges();
  }

  get sessionDate(): Date {
    return this.session.sessionDate.toDate();
  }

  get availablePlayers(): string[] {
    return this.availablePlayerNames;
  }

  get availablePlayersCount(): number {
    return this.session.availableUsers?.length || 0;
  }

  get isPlayerAvailable(): boolean {
    if (!this.currentUser) return false;
    return this.session.availableUsers.includes(this.currentUser.id);
  }

  get isFutureSession(): boolean {
    return this.sessionDate > new Date();
  }

  get hasUserSnack(): boolean {
    if (!this.currentUser) return false;
    return this.session.snacks.some(snack => snack.userId === this.currentUser!.id);
  }

  get hasUserCarpool(): boolean {
    if (!this.currentUser) return false;
    return this.session.carpool.some(car => car.driverId === this.currentUser!.id);
  }

  get userCarpoolHasPassengers(): boolean {
    if (!this.currentUser) return false;
    const userCarpool = this.session.carpool.find(car => car.driverId === this.currentUser!.id);
    return userCarpool ? userCarpool.passengers.length > 0 : false;
  }

  get isUserPassenger(): boolean {
    if (!this.currentUser) return false;
    return this.session.carpool.some(car => 
      car.passengers.some(p => p.userId === this.currentUser!.id)
    );
  }

  get userPassengerCarpool(): any {
    if (!this.currentUser) return null;
    return this.session.carpool.find(car => 
      car.passengers.some(p => p.userId === this.currentUser!.id)
    );
  }

  get availableCarpools(): any[] {
    if (!this.currentUser) return [];
    // Return carpools that aren't full and aren't offered by current user
    return this.session.carpool.filter(car => 
      car.driverId !== this.currentUser!.id &&
      car.passengers.length < car.capacity
    );
  }

  getPassengerNames(carpool: any): string {
    if (!carpool.passengers || carpool.passengers.length === 0) return '';
    return carpool.passengers.map((p: any) => p.userName).join(', ');
  }

  isCurrentUserPassengerInCarpool(carpool: any): boolean {
    if (!this.currentUser || !carpool.passengers) return false;
    return carpool.passengers.some((p: any) => p.userId === this.currentUser!.id);
  }

  get isHost(): boolean {
    if (!this.currentUser) return false;
    return this.session.hostId === this.currentUser.id;
  }

  async addPlayerToSession() {
    if (!this.currentUser || this.isProcessing || !this.isFutureSession) return;
    
    this.setProcessing(true);
    try {
      const result = await this.dbService.confirmAvailability({
        sessionId: this.session.id,
        userId: this.currentUser.id
      });
      
      if (!result.success) {
        console.error('Failed to add player:', result.error);
        alert('Failed to join session. Please try again.');
      } else {
        // Reload player names after successful join
        this.loadAvailablePlayerNames();
      }
    } catch (error) {
      console.error('Error adding player:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.setProcessing(false);
    }
  }

  async removePlayerFromSession() {
    if (!this.currentUser || this.isProcessing || !this.isFutureSession) return;
    
    this.setProcessing(true);
    try {
      const result = await this.dbService.removeAvailability(this.session.id, this.currentUser.id);
      
      if (!result.success) {
        console.error('Failed to remove player:', result.error);
        alert('Failed to leave session. Please try again.');
      } else {
        // Reload player names after successful leave
        this.loadAvailablePlayerNames();
      }
    } catch (error) {
      console.error('Error removing player:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.setProcessing(false);
    }
  }

  async addSnackInfo() {
    if (!this.currentUser || this.isProcessing || !this.snackInput.trim() || !this.isFutureSession) return;
    
    this.setProcessing(true);
    try {
      const result = await this.dbService.addSnack({
        sessionId: this.session.id,
        userId: this.currentUser.id,
        userName: this.currentUser.username,
        snackDescription: this.snackInput.trim()
      });
      
      if (result.success) {
        this.snackInput = '';
      } else {
        console.error('Failed to add snack:', result.error);
        alert('Failed to add snack information. Please try again.');
      }
    } catch (error) {
      console.error('Error adding snack:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.setProcessing(false);
    }
  }

  async addCarpoolInfo() {
    if (!this.currentUser || this.isProcessing || !this.isFutureSession) return;
    
    // Validate capacity
    if (this.carpoolCapacity < 1 || this.carpoolCapacity > 10) {
      alert('Capacity must be between 1 and 10');
      return;
    }
    
    this.setProcessing(true);
    try {
      const result = await this.dbService.addCarpool({
        sessionId: this.session.id,
        driverId: this.currentUser.id,
        driverName: this.currentUser.username,
        capacity: this.carpoolCapacity
      });
      
      if (result.success) {
        this.carpoolInput = '';
      } else {
        console.error('Failed to add carpool:', result.error);
        alert('Failed to add carpool information. Please try again.');
      }
    } catch (error) {
      console.error('Error adding carpool:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.setProcessing(false);
    }
  }

  async removeSnackInfo() {
    if (!this.currentUser || this.isProcessing || !this.isFutureSession) return;
    
    this.setProcessing(true);
    try {
      const result = await this.dbService.removeSnack(this.session.id, this.currentUser.id);
      
      if (!result.success) {
        console.error('Failed to remove snack:', result.error);
        alert('Failed to remove snack information. Please try again.');
      }
    } catch (error) {
      console.error('Error removing snack:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.setProcessing(false);
    }
  }

  async removeCarpoolInfo() {
    if (!this.currentUser || this.isProcessing || !this.isFutureSession) return;
    
    this.setProcessing(true);
    try {
      const result = await this.dbService.leaveCarpool(this.session.id, this.currentUser.id);
      
      if (!result.success) {
        console.error('Failed to remove carpool:', result.error);
        alert('Failed to remove carpool information. Please try again.');
      }
    } catch (error) {
      console.error('Error removing carpool:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.setProcessing(false);
    }
  }

  async joinCarpoolAsPassenger(driverId: string, driverName: string) {
    if (!this.currentUser || this.isProcessing || !this.isFutureSession) return;
    
    // Check if user has a ride offer with passengers
    if (this.userCarpoolHasPassengers) {
      alert('You cannot join another ride while you have passengers in your carpool. Please cancel your ride offer first or ask your passengers to leave.');
      return;
    }
    
    this.setProcessing(true);
    try {
      // If user has an empty ride offer, remove it first
      if (this.hasUserCarpool && !this.userCarpoolHasPassengers) {
        const removeResult = await this.dbService.leaveCarpool(this.session.id, this.currentUser.id);
        if (!removeResult.success) {
          console.error('Failed to remove empty carpool:', removeResult.error);
          alert('Failed to remove your ride offer. Please try again.');
          this.setProcessing(false);
          return;
        }
      }
      
      // Now join the other carpool
      const result = await this.dbService.joinCarpool({
        sessionId: this.session.id,
        driverId: driverId,
        passengerId: this.currentUser.id,
        passengerName: this.currentUser.username
      });
      
      if (!result.success) {
        console.error('Failed to join carpool:', result.error);
        alert(result.error.message || 'Failed to join carpool. Please try again.');
      }
    } catch (error: any) {
      console.error('Error joining carpool:', error);
      alert(error?.message || 'An error occurred. Please try again.');
    } finally {
      this.setProcessing(false);
    }
  }

  async leavePassengerCarpool() {
    if (!this.currentUser || this.isProcessing || !this.isFutureSession) return;
    
    this.setProcessing(true);
    try {
      const result = await this.dbService.leaveCarpool(this.session.id, this.currentUser.id);
      
      if (!result.success) {
        console.error('Failed to leave carpool:', result.error);
        alert('Failed to leave carpool. Please try again.');
      }
    } catch (error) {
      console.error('Error leaving carpool:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.setProcessing(false);
    }
  }

  // Host editing methods
  startEditingHostNotes() {
    this.hostNotesInput = this.session.hostNotes || '';
    this.isEditingHostNotes = true;
  }

  cancelEditingHostNotes() {
    this.isEditingHostNotes = false;
    this.hostNotesInput = '';
  }

  async saveHostNotes() {
    if (!this.isHost || this.isProcessing) return;
    
    this.setProcessing(true);
    try {
      const result = await this.dbService.updateSession({
        sessionId: this.session.id,
        hostNotes: this.hostNotesInput
      });
      
      if (result.success) {
        this.isEditingHostNotes = false;
        this.hostNotesInput = '';
      } else {
        console.error('Failed to update host notes:', result.error);
        alert('Failed to update session notes. Please try again.');
      }
    } catch (error) {
      console.error('Error updating host notes:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.setProcessing(false);
    }
  }

  startEditingSecretNotes() {
    this.secretNotesInput = this.session.secretNotes || '';
    this.isEditingSecretNotes = true;
  }

  cancelEditingSecretNotes() {
    this.isEditingSecretNotes = false;
    this.secretNotesInput = '';
  }

  async saveSecretNotes() {
    if (!this.isHost || this.isProcessing) return;
    
    this.setProcessing(true);
    try {
      const result = await this.dbService.updateSession({
        sessionId: this.session.id,
        secretNotes: this.secretNotesInput
      });
      
      if (result.success) {
        this.isEditingSecretNotes = false;
        this.secretNotesInput = '';
      } else {
        console.error('Failed to update secret notes:', result.error);
        alert('Failed to update secret notes. Please try again.');
      }
    } catch (error) {
      console.error('Error updating secret notes:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.setProcessing(false);
    }
  }

  startEditingExternalAvailability() {
    this.externalAvailabilityInput = this.session.externalAvailability || '';
    this.isEditingExternalAvailability = true;
  }

  cancelEditingExternalAvailability() {
    this.isEditingExternalAvailability = false;
    this.externalAvailabilityInput = '';
  }

  async saveExternalAvailability() {
    if (!this.isHost || this.isProcessing) return;
    
    this.setProcessing(true);
    try {
      const result = await this.dbService.updateSession({
        sessionId: this.session.id,
        externalAvailability: this.externalAvailabilityInput
      });
      
      if (result.success) {
        this.isEditingExternalAvailability = false;
        this.externalAvailabilityInput = '';
      } else {
        console.error('Failed to update external availability:', result.error);
        alert('Failed to update external availability. Please try again.');
      }
    } catch (error) {
      console.error('Error updating external availability:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.setProcessing(false);
    }
  }
  
  // ==================== SESSION CONFIRMATION METHODS ====================
  
  async toggleSessionConfirmation() {
    if (!this.isDM || this.isUpdatingSession) {
      return;
    }
    
    this.setUpdatingSession(true);
    this.updateError = '';
    
    try {
      const updateRequest: UpdateSessionRequest = {
        sessionId: this.session.id,
        isConfirmed: !this.session.isConfirmed
      };
      
      console.log('Updating session confirmation:', updateRequest);
      
      const result = await this.dbService.updateSession(updateRequest);
      
      if (result.success) {
        console.log('Session confirmation updated successfully:', result.data);
        // Update local session data
        this.session = { ...this.session, isConfirmed: result.data.isConfirmed };
        // Emit the updated session to parent components
        this.sessionUpdated.emit(this.session);
        this.updateError = '';
      } else {
        console.error('Failed to update session confirmation:', result.error);
        this.updateError = result.error.message || 'Failed to update session. Please try again.';
      }
    } catch (error) {
      console.error('Error updating session confirmation:', error);
      this.updateError = 'An error occurred while updating the session. Please try again.';
    } finally {
      this.setUpdatingSession(false);
    }
  }
  
  get confirmButtonText(): string {
    if (this.isUpdatingSession) {
      return this.session.isConfirmed ? 'Unconfirming...' : 'Confirming...';
    }
    return this.session.isConfirmed ? 'Unconfirm' : 'Confirm';
  }
  
  get confirmButtonClass(): string {
    return this.session.isConfirmed ? 'btn-warning' : 'btn-success';
  }
}
