import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session-card',
  imports: [CommonModule],
  templateUrl: './session-card.component.html',
  styleUrl: './session-card.component.css'
})
export class SessionCardComponent {
  @Input() date!: Date;
  @Input() availablePlayers: string[] = [];
}
