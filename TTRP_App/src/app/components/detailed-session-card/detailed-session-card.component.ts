import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteCardComponent } from '../note-card/note-card.component';
import { SecretNoteCardComponent } from '../secret-note-card/secret-note-card.component';

@Component({
  selector: 'app-detailed-session-card',
  imports: [CommonModule, NoteCardComponent, SecretNoteCardComponent],
  templateUrl: './detailed-session-card.component.html',
  styleUrl: './detailed-session-card.component.css'
})
export class DetailedSessionCardComponent {
  @Input() date!: Date;
  @Input() availablePlayers: string[] = [];
  @Input() snacks: string = '';
  @Input() carpool: string = '';
  @Input() externalAvailability: string = '';
  @Input() sessionSynopsis: string = '';
  @Input() secretNotes: string = '';
  @Input() isDM: boolean = false;
}
