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
  isProcessing: boolean = false;

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
    if (!this.currentUser || this.isProcessing || !this.carpoolInput.trim() || !this.isFutureSession) return;
    
    this.isProcessing = true;
    try {
      const result = await this.dbService.addCarpool({
        sessionId: this.session.id,
        driverId: this.currentUser.id,
        driverName: this.currentUser.username,
        capacity: 4  // Default capacity, could be made configurable
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
}
