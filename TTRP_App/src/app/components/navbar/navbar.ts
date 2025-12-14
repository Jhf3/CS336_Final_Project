import { Component, Input, Output, EventEmitter, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

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
  private platformId = inject(PLATFORM_ID);
  
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() navigationButtons: NavButton[] = [];
  @Input() isLoggedIn: boolean = false;
  
  constructor(private router: Router) {}
  
  onButtonClick(button: NavButton) {
    if (button.action) {
      button.action();
    }
  }
  
  onAuthButtonClick() {
    if (this.isLoggedIn) {
      // Logout functionality
      this.logout();
    } else {
      // Navigate to login
      this.router.navigate(['/login']);
    }
  }
  
  private logout() {
    if (isPlatformBrowser(this.platformId)) {
      // Clear all user-related data from localStorage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('selectedGroup');
      
      console.log('User logged out');
    }
    
    // Navigate to login page
    this.router.navigate(['/login']);
  }
  
  get authButtonText(): string {
    return this.isLoggedIn ? 'Logout' : 'Login / Register';
  }
  
  get authButtonIcon(): string {
    return this.isLoggedIn ? '🚪' : '🔐';
  }
}
