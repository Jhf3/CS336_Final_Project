import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { collection, collectionData, Firestore, orderBy, query, Timestamp, addDoc } from '@angular/fire/firestore';

export interface FirestoreRec {
  id?: string;
  message: string;
  username: string;
  color: string;
  timestamp: Timestamp;
}

@Injectable({
  providedIn: 'root',
})

export class DatabaseService {
  firestore: Firestore = inject(Firestore);
  mesgs$: Observable<FirestoreRec[]>;
  private collectionRef = collection(this.firestore, 'simpleColl');

  constructor() {
    const q = query(this.collectionRef, orderBy('timestamp', 'desc'));
    this.mesgs$ = collectionData(q, { idField: 'id' }) as Observable<FirestoreRec[]>;
  }

  public submitNewMessage = async (message: string, username: string, color: string): Promise<void> => {
    try {
      const newMessage: Omit<FirestoreRec, 'id'> = {
        message: message.trim(),
        username: username.trim(),
        color: color,
        timestamp: Timestamp.now()
      };

      await addDoc(this.collectionRef, newMessage);
      console.log('Message added successfully!');
    } catch (error) {
      console.error('Error adding message: ', error);
      throw error;
    }
  }
}
