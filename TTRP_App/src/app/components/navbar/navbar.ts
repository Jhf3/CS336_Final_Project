import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface NavButton {
  label: string;
  route: string;
  style?: 'primary' | 'secondary';
  disabled?: boolean;
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
}
