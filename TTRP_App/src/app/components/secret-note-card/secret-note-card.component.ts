import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-secret-note-card',
  imports: [CommonModule],
  templateUrl: './secret-note-card.component.html',
  styleUrl: './secret-note-card.component.css'
})
export class SecretNoteCardComponent {
  @Input() descriptiveNotes: string = '';
}
