import { Component, OnInit, OnDestroy, ChangeDetectorRef, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { DatabaseService } from '../../services/database-service';
import { Group, User, CreateGroupRequest } from '../../../../types/types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  currentUser: User | null = null;
  
  // Subscription management
  private userGroupsSubscription: Subscription | null = null;
  
  // Create group form
  newGroupName: string = '';
  newGroupDescription: string = '';
  
  // Join group form
  joinGroupId: string = '';
  
  // Available groups to join
  availableGroups: Group[] = [];
  
  // User's current groups
  userGroups: Group[] = [];
  
  // UI state
  isLoading: boolean = false;
  isLoadingGroups: boolean = true;
  isCreatingGroup: boolean = false;
  isJoiningGroup: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  activeTab: 'create' | 'join' | 'myGroups' = 'myGroups';
  
  constructor(
    private dbService: DatabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  
  async ngOnInit() {
    // Check if user is logged in (only in browser)
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.currentUser = JSON.parse(storedUser);
    this.setupGroupsStream();
    await this.loadAvailableGroups();
  }
  
  ngOnDestroy() {
    // Clean up subscriptions
    if (this.userGroupsSubscription) {
      this.userGroupsSubscription.unsubscribe();
    }
  }
  
  setupGroupsStream() {
    if (!this.currentUser) return;
    
    this.isLoadingGroups = true;
    this.cdr.detectChanges(); // Force change detection when starting load
    
    // Subscribe to real-time user groups stream
    this.userGroupsSubscription = this.dbService.getUserGroupsStream(this.currentUser.id)
      .subscribe({
        next: (groups: Group[]) => {
          this.userGroups = groups;
          this.isLoadingGroups = false;
          this.cdr.detectChanges(); // Force change detection after data update
        },
        error: (error) => {
          console.error('Error loading user groups stream:', error);
          this.errorMessage = 'Failed to load groups';
          this.isLoadingGroups = false;
          this.cdr.detectChanges(); // Force change detection on error
        }
      });
  }
  
  async loadAvailableGroups() {
    try {
      // Since there's no getAllGroups method, we'll show a message to users
      // that they need to know the group ID to join
      this.availableGroups = [];
    } catch (error) {
      console.error('Error loading available groups:', error);
    }
  }
  
  async onCreateGroup() {
    if (!this.currentUser || !this.newGroupName.trim()) {
      this.errorMessage = 'Group name is required';
      return;
    }
    
    this.isCreatingGroup = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    try {
      const createGroupRequest: CreateGroupRequest = {
        name: this.newGroupName.trim(),
        hostId: this.currentUser.id
      };
      
      const result = await this.dbService.createGroup(createGroupRequest);
      
      if (result.success && result.data) {
        this.successMessage = `Group "${result.data.name}" created successfully!`;
        this.newGroupName = '';
        this.newGroupDescription = '';
        
        // Groups will be automatically updated via stream
        await this.loadAvailableGroups();
        
        // Switch to my groups tab
        this.activeTab = 'myGroups';
      } else {
        this.errorMessage = (!result.success && result.error?.message) || 'Failed to create group';
      }
    } catch (error) {
      console.error('Error creating group:', error);
      this.errorMessage = 'An error occurred while creating the group';
    } finally {
      this.isCreatingGroup = false;
    }
  }
  
  async onJoinGroup(groupId: string) {
    if (!this.currentUser) return;
    
    this.isJoiningGroup = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    try {
      const result = await this.dbService.joinGroup({
        groupId: groupId,
        userId: this.currentUser.id
      });
      
      if (result.success) {
        this.successMessage = 'Successfully joined the group!';
        
        // Groups will be automatically updated via stream
        await this.loadAvailableGroups();
        
        // Switch to my groups tab
        this.activeTab = 'myGroups';
      } else {
        this.errorMessage = (!result.success && result.error?.message) || 'Failed to join group';
      }
    } catch (error) {
      console.error('Error joining group:', error);
      this.errorMessage = 'An error occurred while joining the group';
    } finally {
      this.isJoiningGroup = false;
    }
  }
  
  async onLeaveGroup(groupId: string) {
    if (!this.currentUser || !confirm('Are you sure you want to leave this group?')) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    try {
      const result = await this.dbService.leaveGroup(groupId, this.currentUser.id);
      
      if (result.success) {
        this.successMessage = 'Successfully left the group';
        
        // Groups will be automatically updated via stream
        await this.loadAvailableGroups();
      } else {
        this.errorMessage = (!result.success && result.error?.message) || 'Failed to leave group';
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      this.errorMessage = 'An error occurred while leaving the group';
    } finally {
      this.isLoading = false;
    }
  }
  
  setActiveTab(tab: 'create' | 'join' | 'myGroups') {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }
  
  isCreateFormValid(): boolean {
    return this.newGroupName.trim().length >= 3;
  }
  
  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
  
  onSelectGroup(group: Group) {
    // Store selected group in localStorage
    localStorage.setItem('selectedGroup', JSON.stringify(group));
    
    // Show success message briefly
    this.successMessage = `Selected group: ${group.name}`;
    
    // Navigate back to home page after a short delay
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 1000);
  }
  
  copyGroupCode(groupId: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(groupId).then(() => {
      this.successMessage = 'Group code copied to clipboard!';
      
      // Clear the message after 2 seconds
      setTimeout(() => {
        this.successMessage = '';
        this.cdr.detectChanges();
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy group code:', err);
      this.errorMessage = 'Failed to copy group code';
    });
  }
}