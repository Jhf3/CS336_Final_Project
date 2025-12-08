import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detailed-session-card',
  imports: [CommonModule],
  templateUrl: './detailed-session-card.component.html',
  styleUrl: './detailed-session-card.component.css'
})
export class DetailedSessionCardComponent {
  @Input() date!: Date;
  @Input() availablePlayers: string[] = [];
  @Input() snacks: string = '';
  @Input() carpool: string = '';
  @Input() externalAvailability: string = '';
  @Input() notes: string = '';
  @Input() isDM: boolean = false;
}
