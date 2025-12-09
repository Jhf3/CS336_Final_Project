import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../services/database-service';
import { 
  User, 
  Group, 
  Session, 
  CreateUserRequest, 
  CreateGroupRequest, 
  CreateSessionRequest, 
} from '../../../../types/types';
import { Timestamp } from '@angular/fire/firestore';
import { Navbar, NavButton } from '../../components/navbar/navbar';


@Component({
  selector: 'app-debug',
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './debug.component.html',
  styleUrl: './debug.component.css'
})
export class DebugComponent implements OnInit {
  navigationButtons: NavButton[] = [
    { label: '← Back to Home', route: '/', style: 'secondary' }
  ];
  // Test data
  testUsername = 'test_user_' + Date.now();
  testGroupName = 'Test RPG Group';
  testSessionNotes = 'This is a test session with some notes.';
  
  // Results storage
  currentUser: User | null = null;
  currentGroup: Group | null = null;
  allUsers: User[] = [];
  allGroups: Group[] = [];
  allSessions: Session[] = [];
  
  // UI state
  loading = false;
  messages: string[] = [];
  
  constructor(private dbService: DatabaseService) {}
  
  ngOnInit() {
    this.addMessage('Debug component initialized. Ready to test database operations.');
  }
  
  private addMessage(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.messages.unshift(`[${timestamp}] ${message}`);
    
    // Keep only last 20 messages
    if (this.messages.length > 20) {
      this.messages = this.messages.slice(0, 20);
    }
  }
  
  private async handleResult<T>(operation: string, result: any): Promise<T | null> {
    if (result.success) {
      this.addMessage(`✅ ${operation} successful`);
      return result.data as T;
    } else {
      this.addMessage(`❌ ${operation} failed: ${result.error.message}`);
      return null;
    }
  }
  
  // User Operations
  async createTestUser() {
    this.loading = true;
    try {
      const request: CreateUserRequest = { username: this.testUsername };
      const result = await this.dbService.createUser(request);
      this.currentUser = await this.handleResult<User>('Create User', result);
      if (this.currentUser) {
        this.addMessage(`Created user: ${this.currentUser.username} (ID: ${this.currentUser.id})`);
      }
    } finally {
      this.loading = false;
    }
  }
  
  async loginTestUser() {
    this.loading = true;
    try {
      const result = await this.dbService.getUserByUsername(this.testUsername);
      this.currentUser = await this.handleResult<User>('Login User', result);
      if (this.currentUser) {
        this.addMessage(`Logged in user: ${this.currentUser.username}`);
      }
    } finally {
      this.loading = false;
    }
  }
  
  // Group Operations  
  async createTestGroup() {
    if (!this.currentUser) {
      this.addMessage('❌ Please create/login a user first');
      return;
    }
    
    this.loading = true;
    try {
      const request: CreateGroupRequest = {
        name: this.testGroupName,
        hostId: this.currentUser.id
      };
      const result = await this.dbService.createGroup(request);
      this.currentGroup = await this.handleResult<Group>('Create Group', result);
      if (this.currentGroup) {
        this.addMessage(`Created group: ${this.currentGroup.name} (ID: ${this.currentGroup.id})`);
      }
    } finally {
      this.loading = false;
    }
  }
  
  async getUserGroups() {
    if (!this.currentUser) {
      this.addMessage('❌ Please create/login a user first');
      return;
    }
    
    this.loading = true;
    try {
      const result = await this.dbService.getUserGroups(this.currentUser.id);
      const groups = await this.handleResult<Group[]>('Get User Groups', result);
      if (groups) {
        this.allGroups = groups;
        this.addMessage(`Found ${groups.length} groups for user`);
      }
    } finally {
      this.loading = false;
    }
  }
  
  // Session Operations
  async createTestSession() {
    if (!this.currentGroup) {
      this.addMessage('❌ Please create a group first');
      return;
    }
    
    this.loading = true;
    try {
      const request: CreateSessionRequest = {
        groupId: this.currentGroup.id,
        sessionDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Next week
        hostNotes: this.testSessionNotes,
        isConfirmed: false
      };
      const result = await this.dbService.createSession(request);
      const session = await this.handleResult<Session>('Create Session', result);
      if (session) {
        this.addMessage(`Created session for ${session.sessionDate.toDate().toLocaleDateString()}`);
      }
    } finally {
      this.loading = false;
    }
  }
  
  async getGroupSessions() {
    if (!this.currentGroup) {
      this.addMessage('❌ Please create a group first');
      return;
    }
    
    this.loading = true;
    try {
      const result = await this.dbService.getGroupSessions(this.currentGroup.id);
      const sessions = await this.handleResult<Session[]>('Get Group Sessions', result);
      if (sessions) {
        this.allSessions = sessions;
        this.addMessage(`Found ${sessions.length} sessions for group`);
      }
    } finally {
      this.loading = false;
    }
  }
  
  // Utility Operations
  async testCompleteFlow() {
    this.addMessage('🚀 Starting complete flow test...');
    
    await this.createTestUser();
    if (this.currentUser) {
      await this.createTestGroup();
      if (this.currentGroup) {
        await this.createTestSession();
        await this.getGroupSessions();
        await this.getUserGroups();
      }
    }
    
    this.addMessage('✅ Complete flow test finished!');
  }
  
  clearResults() {
    this.currentUser = null;
    this.currentGroup = null;
    this.allUsers = [];
    this.allGroups = [];
    this.allSessions = [];
    this.messages = [];
    this.testUsername = 'test_user_' + Date.now();
    this.addMessage('🧹 Results cleared');
  }
  
  formatTimestamp(timestamp: Timestamp): string {
    return timestamp.toDate().toLocaleString();
  }
}