import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { DatabaseService } from '../../services/database-service';
import { User } from '../../../../types/types';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
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
    
    // Validate input
    if (!this.username || this.username.trim().length === 0) {
      this.errorMessage = 'Please enter a username';
      return;
    }
    
    // Check username length and format
    const trimmedUsername = this.username.trim();
    if (trimmedUsername.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters long';
      return;
    }
    
    this.isLoading = true;
    
    try {
      // Check if user exists
      const result = await this.dbService.getUserByUsername(trimmedUsername);
      
      if (result.success) {
        // User exists - successful login
        this.successMessage = `Welcome back, ${result.data.username}!`;
        
        // Store user info in localStorage for session management
        localStorage.setItem('currentUser', JSON.stringify(result.data));
        
        // Navigate to dashboard or home page after short delay
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
        
      } else {
        // User doesn't exist - offer to create account
        this.errorMessage = `Username '${trimmedUsername}' not found. Would you like to create a new account?`;
      }
      
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'An error occurred while logging in. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
  
  async onCreateAccount() {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';
    
    // Validate input
    if (!this.username || this.username.trim().length === 0) {
      this.errorMessage = 'Please enter a username';
      return;
    }
    
    const trimmedUsername = this.username.trim();
    if (trimmedUsername.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters long';
      return;
    }
    
    this.isLoading = true;
    
    try {
      // Create new user
      const result = await this.dbService.createUser({ username: trimmedUsername });
      
      if (result.success) {
        // Account created successfully
        this.successMessage = `Account created successfully! Welcome, ${result.data.username}!`;
        
        // Store user info in localStorage
        localStorage.setItem('currentUser', JSON.stringify(result.data));
        
        // Navigate to home page after short delay
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
        
      } else {
        // Account creation failed
        this.errorMessage = result.error.message || 'Failed to create account. Please try again.';
      }
      
    } catch (error) {
      console.error('Account creation error:', error);
      this.errorMessage = 'An error occurred while creating your account. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
  
  onUsernameChange() {
    // Clear messages when user starts typing
    this.errorMessage = '';
    this.successMessage = '';
  }
}
