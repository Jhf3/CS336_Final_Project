import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionCardComponent } from '../session-card/session-card.component';
import { Session } from '../../../../types/types';

@Component({
  selector: 'app-session-list',
  imports: [CommonModule, SessionCardComponent],
  templateUrl: './session-list.component.html',
  styleUrl: './session-list.component.css'
})
export class SessionListComponent {
  @Input() sessions: Session[] = [];
}
