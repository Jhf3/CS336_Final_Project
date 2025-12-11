import { Component, Input, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteCardComponent } from '../note-card/note-card.component';
import { SecretNoteCardComponent } from '../secret-note-card/secret-note-card.component';
import { Session, User } from '../../../../types/types';
import { DatabaseService } from '../../services/database-service';

@Component({
  selector: 'app-detailed-session-card',
  imports: [CommonModule, FormsModule, NoteCardComponent, SecretNoteCardComponent],
  templateUrl: './detailed-session-card.component.html',
  styleUrl: './detailed-session-card.component.css'
})
export class DetailedSessionCardComponent {
  private platformId = inject(PLATFORM_ID);
  
  @Input() session!: Session;
  @Input() snacks: string = '';
  @Input() carpool: string = '';
  @Input() externalAvailability: string = '';
  @Input() sessionSynopsis: string = '';
  @Input() secretNotes: string = '';
  @Input() isDM: boolean = false;
  @Input() currentUser: User | null = null;

  // Form inputs
  snackInput: string = '';
  carpoolInput: string = '';
  carpoolCapacity: number = 4;
  isProcessing: boolean = false;

  // Host editing states
  isEditingHostNotes: boolean = false;
  isEditingSecretNotes: boolean = false;
  isEditingExternalAvailability: boolean = false;
  hostNotesInput: string = '';
  secretNotesInput: string = '';
  externalAvailabilityInput: string = '';

  constructor(private dbService: DatabaseService) {}

  get sessionDate(): Date {
    return this.session.sessionDate.toDate();
  }

  get availablePlayers(): string[] {
    return this.session.availableUsers || [];
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
    
    this.isProcessing = true;
    try {
      const result = await this.dbService.confirmAvailability({
        sessionId: this.session.id,
        userId: this.currentUser.id
      });
      
      if (!result.success) {
        console.error('Failed to add player:', result.error);
        alert('Failed to join session. Please try again.');
      }
    } catch (error) {
      console.error('Error adding player:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  async removePlayerFromSession() {
    if (!this.currentUser || this.isProcessing || !this.isFutureSession) return;
    
    this.isProcessing = true;
    try {
      const result = await this.dbService.removeAvailability(this.session.id, this.currentUser.id);
      
      if (!result.success) {
        console.error('Failed to remove player:', result.error);
        alert('Failed to leave session. Please try again.');
      }
    } catch (error) {
      console.error('Error removing player:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  async addSnackInfo() {
    if (!this.currentUser || this.isProcessing || !this.snackInput.trim() || !this.isFutureSession) return;
    
    this.isProcessing = true;
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
      this.isProcessing = false;
    }
  }

  async addCarpoolInfo() {
    if (!this.currentUser || this.isProcessing || !this.isFutureSession) return;
    
    // Validate capacity
    if (this.carpoolCapacity < 1 || this.carpoolCapacity > 10) {
      alert('Capacity must be between 1 and 10');
      return;
    }
    
    this.isProcessing = true;
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
      this.isProcessing = false;
    }
  }

  async removeSnackInfo() {
    if (!this.currentUser || this.isProcessing || !this.isFutureSession) return;
    
    this.isProcessing = true;
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
      this.isProcessing = false;
    }
  }

  async removeCarpoolInfo() {
    if (!this.currentUser || this.isProcessing || !this.isFutureSession) return;
    
    this.isProcessing = true;
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
      this.isProcessing = false;
    }
  }

  async joinCarpoolAsPassenger(driverId: string, driverName: string) {
    if (!this.currentUser || this.isProcessing || !this.isFutureSession) return;
    
    this.isProcessing = true;
    try {
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
      this.isProcessing = false;
    }
  }

  async leavePassengerCarpool() {
    if (!this.currentUser || this.isProcessing || !this.isFutureSession) return;
    
    this.isProcessing = true;
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
      this.isProcessing = false;
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
    
    this.isProcessing = true;
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
      this.isProcessing = false;
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
    
    this.isProcessing = true;
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
      this.isProcessing = false;
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
    
    this.isProcessing = true;
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
      this.isProcessing = false;
    }
  }
}
