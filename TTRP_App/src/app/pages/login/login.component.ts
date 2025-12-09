import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { DatabaseService } from '../../services/database-service';
import { User } from '../../../../types/types';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  constructor(
    private dbService: DatabaseService,
    private router: Router
  ) {}
  
  async onLogin() {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.username || this.username.trim().length < 3) {
      this.errorMessage = 'Username must be at least 3 characters long';
      return;
    }
    
    this.isLoading = true;
    
    try {
      // Try to get existing user
      const userResult = await this.dbService.getUserByUsername(this.username.trim());
      
      if (userResult.success && userResult.data) {
        // User exists, log them in
        this.successMessage = `Welcome back, ${userResult.data.username}!`;
        
        // Store user info in localStorage for session management
        localStorage.setItem('currentUser', JSON.stringify(userResult.data));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Navigate to home or dashboard after successful login
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
        
      } else {
        // User doesn't exist
        this.errorMessage = `Username "${this.username}" not found. Would you like to create an account?`;
      }
      
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'An error occurred during login. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
  
  async onCreateAccount() {
    if (!this.username || this.username.trim().length < 3) {
      this.errorMessage = 'Username must be at least 3 characters long';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    try {
      const createResult = await this.dbService.createUser({
        username: this.username.trim()
      });
      
      if (createResult.success && createResult.data) {
        this.successMessage = `Account created successfully! Welcome, ${createResult.data.username}!`;
        
        // Store user info in localStorage
        localStorage.setItem('currentUser', JSON.stringify(createResult.data));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Navigate to home after successful account creation
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
        
      } else {
        this.errorMessage = (!createResult.success && createResult.error?.message) || 'Failed to create account. Please try again.';
      }
      
    } catch (error) {
      console.error('Account creation error:', error);
      this.errorMessage = 'An error occurred while creating account. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
  
  onUsernameChange() {
    // Clear error messages when user starts typing
    if (this.errorMessage) {
      this.errorMessage = '';
    }
    if (this.successMessage) {
      this.successMessage = '';
    }
  }
  
  isFormValid(): boolean {
    return this.username.trim().length >= 3;
  }
}