import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { NotificationType, Notification } from '../models/notification.interface';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private readonly STORAGE_KEY = 'notifications';

  constructor(
    private snackBar: MatSnackBar,
    private storageService: StorageService,
    private userService: UserService
  ) {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    const stored = this.storageService.getItem<Notification[]>(this.STORAGE_KEY);
    if (stored) {
      const notifications = stored.map(n => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      this.notifications$.next(notifications);
    }
  }

  private getNotificationMessage(action: NotificationType, itemName: string): string {
    switch (action) {
      case 'PROPOSAL_CREATED': return `New proposal received for ${itemName}`;
      case 'PROPOSAL_WITHDRAWN': return `Proposal for ${itemName} has been withdrawn`;
      case 'PROPOSAL_ACCEPTED': return `Proposal for ${itemName} has been accepted`;
      case 'PROPOSAL_COUNTERED': return `Counter proposal received for ${itemName}`;
      case 'PROPOSAL_ACCEPTED_BY_PARTY': return `Your party has accepted the proposal for ${itemName}`;
    }
  }

  private getNotificationType(action: NotificationType): Notification['type'] {
    switch (action) {
      case 'PROPOSAL_CREATED': return 'info';
      case 'PROPOSAL_WITHDRAWN': return 'warning';
      case 'PROPOSAL_ACCEPTED': return 'success';
      case 'PROPOSAL_COUNTERED': return 'info';
      case 'PROPOSAL_ACCEPTED_BY_PARTY': return 'success';
    }
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  getNotificationsByUser(userId: number): Observable<Notification[]> {
    return this.userService.getUsers().pipe(
      map(users => {
        const user = users.find(u => u.id === userId);
        if (!user) return [];
        
        // Return all notifications for user's party that haven't been cleared by this user
        return this.notifications$.value.filter(n => 
          n.partyId === user.partyId && 
          !(n.clearedBy || []).includes(userId)
        );
      })
    );
  }

  addNotification(message: string, type: Notification['type'] = 'info', options?: {
    itemId?: number;
    partyId?: number;
    proposalId?: number;
  }): void {
    const notification: Notification = {
      id: this.getNextId(),
      message,
      type,
      timestamp: new Date(),
      read: false,
      ...options
    };

    const notifications = [...this.notifications$.value, notification];
    this.storageService.setItem(this.STORAGE_KEY, notifications);
    this.notifications$.next(notifications);

    this.showSnackBar(message, type);
  }

  notifyProposalAction(action: NotificationType, {
    itemId,
    itemName,
    partyIds,
    excludePartyId
  }: {
    itemId: number;
    itemName: string;
    partyIds: number[];
    excludePartyId?: number;
  }): void {
    const targetPartyIds = excludePartyId ? 
      partyIds.filter(id => id !== excludePartyId) : 
      partyIds;

    targetPartyIds.forEach(partyId => {
      const message = this.getNotificationMessage(action, itemName);
      this.addNotification(message, this.getNotificationType(action), {
        itemId,
        partyId
      });
    });
  }

  clearNotifications(userId: number): void {
    const notifications = this.notifications$.value.map(notification => ({
      ...notification,
      clearedBy: [...(notification.clearedBy || []), userId]
    }));
    
    this.storageService.setItem(this.STORAGE_KEY, notifications);
    this.notifications$.next(notifications);
  }

  markAsRead(notificationId: number): void {
    const notifications = this.notifications$.value.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    this.storageService.setItem(this.STORAGE_KEY, notifications);
    this.notifications$.next(notifications);
  }

  private showSnackBar(message: string, type: Notification['type']): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: [`notification-${type}`]
    });
  }

  private getNextId(): number {
    const notifications = this.notifications$.value;
    return notifications.length > 0 
      ? Math.max(...notifications.map(n => n.id)) + 1 
      : 1;
  }

  clearNotification(userId: number, notificationId: number): void {
    const notifications = this.notifications$.value.map(notification => 
      notification.id === notificationId
        ? { ...notification, clearedBy: [...(notification.clearedBy || []), userId] }
        : notification
    );
    
    this.storageService.setItem(this.STORAGE_KEY, notifications);
    this.notifications$.next(notifications);
  }
}