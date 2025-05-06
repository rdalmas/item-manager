import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.interface';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private users: User[] = [];
  private readonly STORAGE_KEY = 'users';

  constructor(private storageService: StorageService) {
    this.loadUsers();
  }

  private async loadUsers(): Promise<void> {
    const storedUsers = this.storageService.getItem<User[]>(this.STORAGE_KEY);
    
    if (storedUsers) {
      this.users = storedUsers;
    } else {
      try {
        const response = await fetch('assets/users.json');
        const users: User[] = await response.json();
        this.users = users;
        this.storageService.setItem(this.STORAGE_KEY, users);
      } catch (error) {
        console.error('Failed to load users:', error);
        throw new Error('Failed to load users data');
      }
    }

    // Try to restore last selected user from storage
    const lastUserId = this.storageService.getItem<number>('lastUserId');
    if (lastUserId) {
      const lastUser = this.users.find(u => u.id === lastUserId);
      if (lastUser) {
        this.currentUser$.next(lastUser);
      }
    }
  }

  setCurrentUser(user: User): void {
    this.currentUser$.next(user);
    this.storageService.setItem('lastUserId', user.id);
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  isUserInParty(userId: number, partyId: number): boolean {
    const user = this.users.find(u => u.id === userId);
    return user?.partyId === partyId;
  }

  getPartyUsers(partyId: number): User[] {
    return this.users.filter(u => u.partyId === partyId);
  }

  getUsers(): Observable<User[]> {
    return new Observable<User[]>(observer => {
      observer.next(this.users);
      observer.complete();
    });
  }

  getCurrentUserPartyMembers(): Observable<User[]> {
    return this.currentUser$.pipe(
      map(user => {
        if (!user) return [];
        return this.users.filter(u => u.partyId === user.partyId);
      })
    );
  }

  getUserNameByParty(userId: number, partyId: number): string | undefined {
    const user = this.users.find(u => u.id === userId);
    return user?.partyId === partyId ? user.name : undefined;
  }

  getCurrentUserSync(): User | null {
    return this.currentUser$.value;
  }
}