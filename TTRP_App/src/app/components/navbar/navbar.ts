import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface NavButton {
  label: string;
  route?: string;
  action?: () => void;
  style?: 'primary' | 'secondary';
  disabled?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() navigationButtons: NavButton[] = [];
  
  onButtonClick(button: NavButton) {
    if (button.action) {
      button.action();
    }
  }
}
