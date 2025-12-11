import { Timestamp } from '@angular/fire/firestore';

// User-related interfaces
export interface User {
  id: string;  // Document ID in Firestore
  username: string;
  createdAt: Timestamp;
  groupIds: string[];  // Array of group IDs the user belongs to
}

// Group-related interfaces
export interface Group {
  id: string;  // Document ID in Firestore
  name: string;
  hostId: string;  // Reference to the host user ID
  hostName: string;  // Denormalized for easier display
  memberIds: string[];  // Array of member user IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Member information for display purposes
export interface GroupMember {
  id: string;  // User ID
  username: string;
  joinedAt: Timestamp;
  isHost: boolean;
}

// Session-related sub-interfaces
export interface SessionSnack {
  userId: string;
  userName: string;
  snackDescription: string;
}

export interface SessionPassenger {
  userId: string;
  userName: string;
}

export interface SessionCarpool {
  driverId: string;
  driverName: string;
  capacity: number;
  passengers: SessionPassenger[];
}

// Session-related interfaces
export interface Session {
  id: string;  // Document ID in Firestore
  groupId: string;  // Reference to the parent group
  groupName: string;  // Denormalized for easier display
  hostId: string;  // Reference to the host user ID
  hostName: string;  // Denormalized for easier display
  isConfirmed: boolean;
  sessionDate: Timestamp;
  hostNotes: string;
  availableUsers: string[];  // Array of user IDs who confirmed availability
  snacks: SessionSnack[];  // Array of snack contributions
  carpool: SessionCarpool[];  // Array of carpool arrangements
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Request/Response interfaces for API operations
export interface CreateUserRequest {
  username: string;
}

export interface CreateGroupRequest {
  name: string;
  hostId: string;
}

export interface CreateSessionRequest {
  groupId: string;
  sessionDate: Timestamp;
  hostNotes?: string;
  isConfirmed?: boolean;
  availableUsers?: string[];
  snacks?: SessionSnack[];
  carpool?: SessionCarpool[];
}

export interface UpdateSessionRequest {
  sessionId: string;
  isConfirmed?: boolean;
  sessionDate?: Timestamp;
  hostNotes?: string;
  availableUsers?: string[];
  snacks?: SessionSnack[];
  carpool?: SessionCarpool[];
}

// New request interfaces for session management
export interface ConfirmAvailabilityRequest {
  sessionId: string;
  userId: string;
}

export interface AddSnackRequest {
  sessionId: string;
  userId: string;
  userName: string;
  snackDescription: string;
}

export interface AddCarpoolRequest {
  sessionId: string;
  driverId: string;
  driverName: string;
  capacity: number;
}

export interface JoinCarpoolRequest {
  sessionId: string;
  driverId: string;
  passengerId: string;
  passengerName: string;
}

export interface JoinGroupRequest {
  groupId: string;
  userId: string;
}

// Firestore document references for type safety
export interface FirestoreCollections {
  users: 'users';
  groups: 'groups';
  sessions: 'sessions';
}

// Response interfaces for queries
export interface GroupWithMembers extends Group {
  members: GroupMember[];
  sessionCount: number;
}

export interface GroupWithSessions extends Group {
  sessions: Session[];
  members: GroupMember[];
}

export interface UserWithGroups extends User {
  groups: Group[];
}

// Utility interfaces for Firebase operations
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

// Error handling
export interface DatabaseError {
  code: string;
  message: string;
  details?: any;
}

// Constants for Firestore collections
export const COLLECTIONS = {
  USERS: 'users',
  GROUPS: 'groups', 
  SESSIONS: 'sessions'
} as const;

// Database operation result types
export type DatabaseResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: DatabaseError;
};

// Query filter interfaces
export interface GroupFilter {
  hostId?: string;
  memberIds?: string[];
  name?: string;
}

export interface SessionFilter {
  groupId?: string;
  hostId?: string;
  isConfirmed?: boolean;
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
}