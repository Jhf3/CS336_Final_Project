import { inject, Injectable } from '@angular/core';
import { Observable, from, map, switchMap, combineLatest } from 'rxjs';
import { 
  collection, 
  collectionData, 
  Firestore, 
  orderBy, 
  query, 
  Timestamp, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  where, 
  arrayUnion, 
  arrayRemove,
  writeBatch,
  getDocs
} from '@angular/fire/firestore';

// Import all the types we defined
import {
  User,
  Group,
  Session,
  GroupMember,
  SessionSnack,
  SessionCarpool,
  SessionPassenger,
  CreateUserRequest,
  CreateGroupRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  JoinGroupRequest,
  ConfirmAvailabilityRequest,
  AddSnackRequest,
  AddCarpoolRequest,
  JoinCarpoolRequest,
  GroupWithMembers,
  GroupWithSessions,
  UserWithGroups,
  DatabaseResult,
  DatabaseError,
  GroupFilter,
  SessionFilter,
  COLLECTIONS
} from '../../../types/types';

@Injectable({
  providedIn: 'root',
})

export class DatabaseService {
  firestore: Firestore = inject(Firestore);

  // Collection references
  private usersCollection = collection(this.firestore, COLLECTIONS.USERS);
  private groupsCollection = collection(this.firestore, COLLECTIONS.GROUPS);
  private sessionsCollection = collection(this.firestore, COLLECTIONS.SESSIONS);

  constructor() {}

  // ==================== USER OPERATIONS ====================

  /**
   * Create a new user with username (no password/authentication)
   */
  async createUser(request: CreateUserRequest): Promise<DatabaseResult<User>> {
    try {
      // Check if username already exists
      const existingUser = await this.getUserByUsername(request.username);
      if (existingUser.success) {
        return {
          success: false,
          error: { code: 'username-exists', message: 'Username already exists' }
        };
      }

      const newUser: Omit<User, 'id'> = {
        username: request.username.trim(),
        createdAt: Timestamp.now(),
        groupIds: []
      };

      const docRef = await addDoc(this.usersCollection, newUser);
      const createdUser: User = { ...newUser, id: docRef.id };

      return { success: true, data: createdUser };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user by username (for login)
   */
  async getUserByUsername(username: string): Promise<DatabaseResult<User>> {
    try {
      const q = query(this.usersCollection, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: false,
          error: { code: 'user-not-found', message: 'User not found' }
        };
      }

      const userDoc = querySnapshot.docs[0];
      const user: User = { id: userDoc.id, ...userDoc.data() } as User;

      return { success: true, data: user };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<DatabaseResult<User>> {
    try {
      const userDoc = await getDoc(doc(this.usersCollection, userId));
      
      if (!userDoc.exists()) {
        return {
          success: false,
          error: { code: 'user-not-found', message: 'User not found' }
        };
      }

      const user: User = { id: userDoc.id, ...userDoc.data() } as User;
      return { success: true, data: user };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user with their groups
   */
  async getUserWithGroups(userId: string): Promise<DatabaseResult<UserWithGroups>> {
    try {
      const userResult = await this.getUserById(userId);
      if (!userResult.success) return userResult;

      const user = userResult.data;
      const groups: Group[] = [];

      // Get all groups for this user
      for (const groupId of user.groupIds) {
        const groupResult = await this.getGroupById(groupId);
        if (groupResult.success) {
          groups.push(groupResult.data);
        }
      }

      const userWithGroups: UserWithGroups = { ...user, groups };
      return { success: true, data: userWithGroups };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== GROUP OPERATIONS ====================

  /**
   * Create a new group
   */
  async createGroup(request: CreateGroupRequest): Promise<DatabaseResult<Group>> {
    try {
      // Verify host user exists
      const hostResult = await this.getUserById(request.hostId);
      if (!hostResult.success) return hostResult;

      const host = hostResult.data;
      const newGroup: Omit<Group, 'id'> = {
        name: request.name.trim(),
        hostId: request.hostId,
        hostName: host.username,
        memberIds: [request.hostId], // Host is automatically a member
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(this.groupsCollection, newGroup);
      const createdGroup: Group = { ...newGroup, id: docRef.id };

      // Update user's groupIds
      await this.addUserToGroup({ groupId: docRef.id, userId: request.hostId });

      return { success: true, data: createdGroup };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get group by ID
   */
  async getGroupById(groupId: string): Promise<DatabaseResult<Group>> {
    try {
      const groupDoc = await getDoc(doc(this.groupsCollection, groupId));
      
      if (!groupDoc.exists()) {
        return {
          success: false,
          error: { code: 'group-not-found', message: 'Group not found' }
        };
      }

      const group: Group = { id: groupDoc.id, ...groupDoc.data() } as Group;
      return { success: true, data: group };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get group with members
   */
  async getGroupWithMembers(groupId: string): Promise<DatabaseResult<GroupWithMembers>> {
    try {
      const groupResult = await this.getGroupById(groupId);
      if (!groupResult.success) return groupResult;

      const group = groupResult.data;
      const members: GroupMember[] = [];

      // Get all member details
      for (const memberId of group.memberIds) {
        const userResult = await this.getUserById(memberId);
        if (userResult.success) {
          const user = userResult.data;
          members.push({
            id: user.id,
            username: user.username,
            joinedAt: user.createdAt, // Could track actual join date separately
            isHost: user.id === group.hostId
          });
        }
      }

      // Get session count
      const sessionsResult = await this.getGroupSessions(groupId);
      const sessionCount = sessionsResult.success ? sessionsResult.data.length : 0;

      const groupWithMembers: GroupWithMembers = { 
        ...group, 
        members, 
        sessionCount 
      };

      return { success: true, data: groupWithMembers };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get group with sessions and members
   */
  async getGroupWithSessions(groupId: string): Promise<DatabaseResult<GroupWithSessions>> {
    try {
      const groupWithMembersResult = await this.getGroupWithMembers(groupId);
      if (!groupWithMembersResult.success) return groupWithMembersResult;

      const groupWithMembers = groupWithMembersResult.data;
      const sessionsResult = await this.getGroupSessions(groupId);
      const sessions = sessionsResult.success ? sessionsResult.data : [];

      const groupWithSessions: GroupWithSessions = {
        ...groupWithMembers,
        sessions
      };

      return { success: true, data: groupWithSessions };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Join a group
   */
  async joinGroup(request: JoinGroupRequest): Promise<DatabaseResult<void>> {
    try {
      // Verify user and group exist
      const userResult = await this.getUserById(request.userId);
      const groupResult = await this.getGroupById(request.groupId);
      
      if (!userResult.success) return userResult;
      if (!groupResult.success) return groupResult;

      const group = groupResult.data;

      // Check if user is already a member
      if (group.memberIds.includes(request.userId)) {
        return {
          success: false,
          error: { code: 'already-member', message: 'User is already a member of this group' }
        };
      }

      // Add user to group
      await this.addUserToGroup(request);
      return { success: true, data: undefined };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string, userId: string): Promise<DatabaseResult<void>> {
    try {
      const groupResult = await this.getGroupById(groupId);
      if (!groupResult.success) return groupResult;

      const group = groupResult.data;

      // Check if user is the host
      if (group.hostId === userId) {
        return {
          success: false,
          error: { code: 'host-cannot-leave', message: 'Host cannot leave the group. Transfer ownership or delete the group.' }
        };
      }

      // Remove user from group and group from user
      await this.removeUserFromGroup(groupId, userId);
      return { success: true, data: undefined };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get groups for a user
   */
  async getUserGroups(userId: string): Promise<DatabaseResult<Group[]>> {
    try {
      const q = query(this.groupsCollection, where('memberIds', 'array-contains', userId));
      const querySnapshot = await getDocs(q);

      const groups: Group[] = [];
      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() } as Group);
      });

      return { success: true, data: groups };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== SESSION OPERATIONS ====================

  /**
   * Create a new session
   */
  async createSession(request: CreateSessionRequest): Promise<DatabaseResult<Session>> {
    try {
      // Verify group exists and user is host
      const groupResult = await this.getGroupById(request.groupId);
      if (!groupResult.success) return groupResult;

      const group = groupResult.data;
      
      const newSession: Omit<Session, 'id'> = {
        groupId: group.id,
        groupName: group.name,
        hostId: group.hostId,
        hostName: group.hostName,
        isConfirmed: request.isConfirmed ?? false,
        sessionDate: request.sessionDate,
        hostNotes: request.hostNotes ?? '',
        secretNotes: request.secretNotes ?? '',
        externalAvailability: request.externalAvailability ?? '',
        availableUsers: request.availableUsers ?? [],
        snacks: request.snacks ?? [],
        carpool: request.carpool ?? [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(this.sessionsCollection, newSession);
      const createdSession: Session = { ...newSession, id: docRef.id };

      return { success: true, data: createdSession };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update a session
   */
  async updateSession(request: UpdateSessionRequest): Promise<DatabaseResult<Session>> {
    try {
      const sessionRef = doc(this.sessionsCollection, request.sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        return {
          success: false,
          error: { code: 'session-not-found', message: 'Session not found' }
        };
      }

      const updateData: Partial<Session> = {
        updatedAt: Timestamp.now()
      };

      if (request.isConfirmed !== undefined) updateData.isConfirmed = request.isConfirmed;
      if (request.sessionDate) updateData.sessionDate = request.sessionDate;
      if (request.hostNotes !== undefined) updateData.hostNotes = request.hostNotes;
      if (request.secretNotes !== undefined) updateData.secretNotes = request.secretNotes;
      if (request.externalAvailability !== undefined) updateData.externalAvailability = request.externalAvailability;

      await updateDoc(sessionRef, updateData);

      const updatedDoc = await getDoc(sessionRef);
      const updatedSession: Session = { id: updatedDoc.id, ...updatedDoc.data() } as Session;

      return { success: true, data: updatedSession };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get a single session by ID
   */
  async getSessionById(sessionId: string): Promise<DatabaseResult<Session>> {
    try {
      const sessionRef = doc(this.sessionsCollection, sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        return {
          success: false,
          error: { code: 'session-not-found', message: 'Session not found' }
        };
      }

      const session: Session = { id: sessionDoc.id, ...sessionDoc.data() } as Session;
      return { success: true, data: session };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get sessions for a group
   */
  async getGroupSessions(groupId: string): Promise<DatabaseResult<Session[]>> {
    try {
      const q = query(
        this.sessionsCollection, 
        where('groupId', '==', groupId)
      );
      const querySnapshot = await getDocs(q);

      const sessions: Session[] = [];
      querySnapshot.forEach((doc) => {
        sessions.push({ id: doc.id, ...doc.data() } as Session);
      });

      // Sort sessions by date descending (client-side)
      sessions.sort((a, b) => b.sessionDate.toDate().getTime() - a.sessionDate.toDate().getTime());

      return { success: true, data: sessions };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get sessions for a host
   */
  async getHostSessions(hostId: string): Promise<DatabaseResult<Session[]>> {
    try {
      const q = query(
        this.sessionsCollection,
        where('hostId', '==', hostId),
        orderBy('sessionDate', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const sessions: Session[] = [];
      querySnapshot.forEach((doc) => {
        sessions.push({ id: doc.id, ...doc.data() } as Session);
      });

      return { success: true, data: sessions };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<DatabaseResult<void>> {
    try {
      await deleteDoc(doc(this.sessionsCollection, sessionId));
      return { success: true, data: undefined };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Add user to group (internal helper)
   */
  private async addUserToGroup(request: JoinGroupRequest): Promise<void> {
    const batch = writeBatch(this.firestore);

    // Add user to group's memberIds
    const groupRef = doc(this.groupsCollection, request.groupId);
    batch.update(groupRef, {
      memberIds: arrayUnion(request.userId),
      updatedAt: Timestamp.now()
    });

    // Add group to user's groupIds
    const userRef = doc(this.usersCollection, request.userId);
    batch.update(userRef, {
      groupIds: arrayUnion(request.groupId)
    });

    await batch.commit();
  }

  /**
   * Remove user from group (internal helper)
   */
  private async removeUserFromGroup(groupId: string, userId: string): Promise<void> {
    const batch = writeBatch(this.firestore);

    // Remove user from group's memberIds
    const groupRef = doc(this.groupsCollection, groupId);
    batch.update(groupRef, {
      memberIds: arrayRemove(userId),
      updatedAt: Timestamp.now()
    });

    // Remove group from user's groupIds
    const userRef = doc(this.usersCollection, userId);
    batch.update(userRef, {
      groupIds: arrayRemove(groupId)
    });

    await batch.commit();
  }

  /**
   * Error handling helper
   */
  private handleError(error: any): DatabaseResult<never> {
    console.error('Database operation error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'unknown-error',
        message: error.message || 'An unknown error occurred',
        details: error
      }
    };
  }

  // ==================== OBSERVABLE STREAMS ====================

  /**
   * Get real-time stream of user's groups
   */
  getUserGroupsStream(userId: string): Observable<Group[]> {
    const q = query(this.groupsCollection, where('memberIds', 'array-contains', userId));
    return collectionData(q, { idField: 'id' }) as Observable<Group[]>;
  }

  /**
   * Get real-time stream of group sessions
   */
  getGroupSessionsStream(groupId: string): Observable<Session[]> {
    const q = query(
      this.sessionsCollection,
      where('groupId', '==', groupId)
    );
    return collectionData(q, { idField: 'id' }).pipe(
      map((sessions: any[]) => sessions.sort((a, b) => 
        b.sessionDate.toDate().getTime() - a.sessionDate.toDate().getTime()
      ))
    ) as Observable<Session[]>;
  }

  /**
   * Get real-time stream of group members
   */
  getGroupMembersStream(groupId: string): Observable<GroupMember[]> {
    return from(this.getGroupWithMembers(groupId)).pipe(
      map(result => result.success ? result.data.members : [])
    );
  }

  // ==================== SESSION MANAGEMENT OPERATIONS ====================

  /**
   * Confirm user availability for a session
   */
  async confirmAvailability(request: ConfirmAvailabilityRequest): Promise<DatabaseResult<void>> {
    try {
      const sessionResult = await this.getSessionById(request.sessionId);
      if (!sessionResult.success) return sessionResult;

      const session = sessionResult.data;
      
      // Add user to available users if not already present
      if (!session.availableUsers.includes(request.userId)) {
        const updatedUsers = [...session.availableUsers, request.userId];
        
        const sessionRef = doc(this.sessionsCollection, request.sessionId);
        await updateDoc(sessionRef, {
          availableUsers: updatedUsers,
          updatedAt: Timestamp.now()
        });
      }

      return { success: true, data: undefined };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Remove user availability for a session
   */
  async removeAvailability(sessionId: string, userId: string): Promise<DatabaseResult<void>> {
    try {
      const sessionResult = await this.getSessionById(sessionId);
      if (!sessionResult.success) return sessionResult;

      const session = sessionResult.data;
      const updatedUsers = session.availableUsers.filter((id: string) => id !== userId);
      
      const sessionRef = doc(this.sessionsCollection, sessionId);
      await updateDoc(sessionRef, {
        availableUsers: updatedUsers,
        updatedAt: Timestamp.now()
      });

      return { success: true, data: undefined };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Add snack contribution to a session
   */
  async addSnack(request: AddSnackRequest): Promise<DatabaseResult<void>> {
    try {
      const sessionResult = await this.getSessionById(request.sessionId);
      if (!sessionResult.success) return sessionResult;

      const session = sessionResult.data;
      
      // Remove existing snack from this user if any, then add new one
      const updatedSnacks = session.snacks.filter((snack: SessionSnack) => snack.userId !== request.userId);
      updatedSnacks.push({
        userId: request.userId,
        userName: request.userName,
        snackDescription: request.snackDescription
      });
      
      const sessionRef = doc(this.sessionsCollection, request.sessionId);
      await updateDoc(sessionRef, {
        snacks: updatedSnacks,
        updatedAt: Timestamp.now()
      });

      return { success: true, data: undefined };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Remove snack contribution from a session
   */
  async removeSnack(sessionId: string, userId: string): Promise<DatabaseResult<void>> {
    try {
      const sessionResult = await this.getSessionById(sessionId);
      if (!sessionResult.success) return sessionResult;

      const session = sessionResult.data;
      const updatedSnacks = session.snacks.filter((snack: SessionSnack) => snack.userId !== userId);
      
      const sessionRef = doc(this.sessionsCollection, sessionId);
      await updateDoc(sessionRef, {
        snacks: updatedSnacks,
        updatedAt: Timestamp.now()
      });

      return { success: true, data: undefined };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Add carpool offer to a session
   */
  async addCarpool(request: AddCarpoolRequest): Promise<DatabaseResult<void>> {
    try {
      const sessionResult = await this.getSessionById(request.sessionId);
      if (!sessionResult.success) return sessionResult;

      const session = sessionResult.data;
      
      // Remove existing carpool from this driver if any, then add new one
      const updatedCarpool = session.carpool.filter((car: SessionCarpool) => car.driverId !== request.driverId);
      updatedCarpool.push({
        driverId: request.driverId,
        driverName: request.driverName,
        capacity: request.capacity,
        passengers: []
      });
      
      const sessionRef = doc(this.sessionsCollection, request.sessionId);
      await updateDoc(sessionRef, {
        carpool: updatedCarpool,
        updatedAt: Timestamp.now()
      });

      return { success: true, data: undefined };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Join a carpool for a session
   */
  async joinCarpool(request: JoinCarpoolRequest): Promise<DatabaseResult<void>> {
    try {
      const sessionResult = await this.getSessionById(request.sessionId);
      if (!sessionResult.success) return sessionResult;

      const session = sessionResult.data;
      
      // Find the carpool and add passenger if there's capacity
      const updatedCarpool = session.carpool.map((car: SessionCarpool) => {
        if (car.driverId === request.driverId) {
          // Remove passenger from any existing carpool first
          const cleanedPassengers = car.passengers.filter((p: SessionPassenger) => p.userId !== request.passengerId);
          
          // Check capacity
          if (cleanedPassengers.length >= car.capacity) {
            throw new Error('Carpool is at full capacity');
          }
          
          return {
            ...car,
            passengers: [...cleanedPassengers, {
              userId: request.passengerId,
              userName: request.passengerName
            }]
          };
        }
        // Remove passenger from other carpools
        return {
          ...car,
          passengers: car.passengers.filter((p: SessionPassenger) => p.userId !== request.passengerId)
        };
      });
      
      const sessionRef = doc(this.sessionsCollection, request.sessionId);
      await updateDoc(sessionRef, {
        carpool: updatedCarpool,
        updatedAt: Timestamp.now()
      });

      return { success: true, data: undefined };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Leave all carpools for a session
   */
  async leaveCarpool(sessionId: string, userId: string): Promise<DatabaseResult<void>> {
    try {
      const sessionResult = await this.getSessionById(sessionId);
      if (!sessionResult.success) return sessionResult;

      const session = sessionResult.data;
      
      // Remove user from all carpools as passenger, or remove entire carpool if they're the driver
      const updatedCarpool = session.carpool
        .filter((car: SessionCarpool) => car.driverId !== userId) // Remove if user is driver
        .map((car: SessionCarpool) => ({
          ...car,
          passengers: car.passengers.filter((p: SessionPassenger) => p.userId !== userId) // Remove as passenger
        }));
      
      const sessionRef = doc(this.sessionsCollection, sessionId);
      await updateDoc(sessionRef, {
        carpool: updatedCarpool,
        updatedAt: Timestamp.now()
      });

      return { success: true, data: undefined };
    } catch (error) {
      return this.handleError(error);
    }
  }
}
