import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { map, Observable, Subject, switchMap, take, takeUntil } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.interface';
import { MatDividerModule } from '@angular/material/divider';
import { UserService } from '../../../core/services/user.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, MatBadgeModule, MatIconModule, MatMenuModule, MatButtonModule, MatDividerModule, RouterModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications$: Observable<Notification[]>;
  unreadCount$: Observable<number>;
  private destroy$ = new Subject<void>();
  
  constructor(
    private notificationService: NotificationService, 
    private userService: UserService,
    private router: Router
  ) {
    // Subscribe to user changes and update notifications accordingly
    this.notifications$ = this.userService.getCurrentUser().pipe(
      takeUntil(this.destroy$),
      switchMap(user => this.notificationService.getNotificationsByUser(user?.id || 0))
    );

    // Calculate unread count from notifications stream
    this.unreadCount$ = this.notifications$.pipe(
      map(notifications => notifications.filter(n => !n.read).length)
    );
  }

  ngOnInit(): void {}

  onMenuOpened(): void {
    // Mark all notifications as read when menu opens
    this.notifications$.pipe(take(1)).subscribe(notifications => {
      notifications
        .filter(n => !n.read)
        .forEach(n => this.notificationService.markAsRead(n.id));
    });
  }

  clearNotification(notificationId: number): void {
    const currentUser = this.userService.getCurrentUserSync();
    if (currentUser) {
      this.notificationService.clearNotification(currentUser.id, notificationId);
    }
  }

  goToItem(notification: Notification): void {
    if (notification.itemId) {
      this.router.navigate(['/items', notification.itemId]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}