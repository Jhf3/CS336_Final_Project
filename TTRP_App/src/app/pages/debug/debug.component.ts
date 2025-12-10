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
  
  async populateSampleData() {
    /* 
     * SAMPLE DATA OVERVIEW:
     * This function populates the Firebase database with realistic sample data for testing.
     * 
     * USERS (5 total):
     * - john_doe, jane_smith, mike_wizard, sarah_rogue, alex_fighter
     * - Each user gets auto-generated ID, username, creation timestamp, and empty groupIds array
     * 
     * GROUPS (3 total):
     * - "Weekly D&D Campaign" (hosted by john_doe) - Fantasy RPG with 3-4 members
     * - "Pathfinder Society" (hosted by jane_smith) - Organized play with 3-4 members  
     * - "Call of Cthulhu Mystery" (hosted by mike_wizard) - Horror investigation with 3-4 members
     * - Each group gets host, members, creation/update timestamps, and denormalized host name
     * 
     * SESSIONS (4 total):
     * - Spread across next 3 weeks with realistic dates
     * - Session 1: Character creation (3 days from now, confirmed)
     * - Session 2: Castle exploration (1 week from now, confirmed) 
     * - Session 3: Boss fight (2 weeks from now, unconfirmed)
     * - Session 4: City intrigue (3 weeks from now, unconfirmed)
     * - Each session includes group reference, host info, notes, and confirmation status
     * 
     * RELATIONSHIPS:
     * - Users are automatically added to multiple groups as members
     * - Groups maintain memberIds arrays and hosts can't leave their own groups
     * - Sessions reference their parent groups and include denormalized data for performance
     */
    this.loading = true;
    this.addMessage('🌱 Starting sample data population...');
    
    try {
      // Create sample users
      const sampleUsers = [
        { username: 'john_doe' },
        { username: 'jane_smith' },
        { username: 'mike_wizard' },
        { username: 'sarah_rogue' },
        { username: 'alex_fighter' }
      ];
      
      const createdUsers: User[] = [];
      
      for (const userData of sampleUsers) {
        try {
          const result = await this.dbService.createUser(userData);
          if (result.success && result.data) {
            createdUsers.push(result.data);
            this.addMessage(`✅ Created user: ${result.data.username}`);
          } else {
            // User might already exist, try to get them
            const existingResult = await this.dbService.getUserByUsername(userData.username);
            if (existingResult.success && existingResult.data) {
              createdUsers.push(existingResult.data);
              this.addMessage(`🔄 Found existing user: ${existingResult.data.username}`);
            }
          }
        } catch (error) {
          this.addMessage(`⚠️ Error with user ${userData.username}: ${error}`);
        }
      }
      
      if (createdUsers.length === 0) {
        this.addMessage('❌ No users available for group creation');
        return;
      }
      
      // Create sample groups
      const sampleGroups = [
        {
          name: 'Weekly D&D Campaign',
          hostId: createdUsers[0].id,
          description: 'Epic fantasy adventure every Friday night'
        },
        {
          name: 'Pathfinder Society',
          hostId: createdUsers[1].id,
          description: 'Organized play sessions'
        },
        {
          name: 'Call of Cthulhu Mystery',
          hostId: createdUsers[2].id,
          description: 'Horror investigation campaign'
        }
      ];
      
      const createdGroups: Group[] = [];
      
      for (let i = 0; i < sampleGroups.length; i++) {
        const groupData = sampleGroups[i];
        try {
          const groupRequest: CreateGroupRequest = {
            name: groupData.name,
            hostId: groupData.hostId
          };
          
          const result = await this.dbService.createGroup(groupRequest);
          if (result.success && result.data) {
            createdGroups.push(result.data);
            this.addMessage(`✅ Created group: ${result.data.name}`);
            
            // Add some members to each group
            const membersToAdd = createdUsers.slice(1, Math.min(4, createdUsers.length));
            for (const member of membersToAdd) {
              if (member.id !== groupData.hostId) {
                try {
                  await this.dbService.joinGroup({
                    groupId: result.data.id,
                    userId: member.id
                  });
                  this.addMessage(`✅ Added ${member.username} to ${result.data.name}`);
                } catch (error) {
                  this.addMessage(`⚠️ Failed to add ${member.username} to group`);
                }
              }
            }
          }
        } catch (error) {
          this.addMessage(`⚠️ Error creating group ${groupData.name}: ${error}`);
        }
      }
      
      // Create sample sessions
      if (createdGroups.length > 0) {
        const sessionDates = [
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        ];
        
        const sessionNotes = [
          'Character creation and campaign introduction. Bring dice and character sheets!',
          'Continue exploring the haunted castle. Remember to bring your spell components.',
          'Major boss fight scheduled! Make sure characters are leveled up.',
          'City intrigue arc begins. Perfect for roleplay-focused players.'
        ];
        
        for (let i = 0; i < Math.min(createdGroups.length, sessionDates.length); i++) {
          const group = createdGroups[i];
          const sessionDate = sessionDates[i];
          const notes = sessionNotes[i];
          
          try {
            const sessionRequest: CreateSessionRequest = {
              groupId: group.id,
              sessionDate: Timestamp.fromDate(sessionDate),
              hostNotes: notes,
              isConfirmed: i < 2 // First 2 sessions are confirmed
            };
            
            const result = await this.dbService.createSession(sessionRequest);
            if (result.success && result.data) {
              this.addMessage(`✅ Created session for ${group.name} on ${sessionDate.toLocaleDateString()}`);
            }
          } catch (error) {
            this.addMessage(`⚠️ Error creating session for ${group.name}: ${error}`);
          }
        }
      }
      
      this.addMessage('🎉 Sample data population completed!');
      this.addMessage(`📊 Summary: ${createdUsers.length} users, ${createdGroups.length} groups, ${Math.min(createdGroups.length, 4)} sessions`);
      
    } catch (error) {
      this.addMessage(`❌ Error during sample data population: ${error}`);
    } finally {
      this.loading = false;
    }
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