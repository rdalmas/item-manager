import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationComponent } from './notification.component';
import { NotificationService } from '../../../core/services/notification.service';
import { UserService } from '../../../core/services/user.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MOCK_USERS } from '../../../../test/mock';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;

  const mockNotifications = [
    {
      id: 1,
      message: 'Test notification',
      type: 'info' as 'info',
      timestamp: new Date(),
      read: false,
      itemId: 1
    }
  ];

  beforeEach(async () => {
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', 
      ['getNotificationsByUser', 'markAsRead', 'clearNotification']);
    const userServiceSpy = jasmine.createSpyObj('UserService', 
      ['getCurrentUser', 'getCurrentUserSync']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        MatBadgeModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatDividerModule,
        NotificationComponent
      ],
      providers: [
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    userService.getCurrentUser.and.returnValue(of(MOCK_USERS[0]));
    userService.getCurrentUserSync.and.returnValue(MOCK_USERS[0]);
    notificationService.getNotificationsByUser.and.returnValue(of(mockNotifications));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load notifications for current user', (done) => {
    component.notifications$.subscribe(notifications => {
      expect(notifications).toEqual(mockNotifications);
      expect(notificationService.getNotificationsByUser).toHaveBeenCalledWith(MOCK_USERS[0].id);
      done();
    });
  });

  it('should mark notifications as read when menu opens', () => {
    component.onMenuOpened();
    expect(notificationService.markAsRead).toHaveBeenCalledWith(mockNotifications[0].id);
  });

  it('should clear notification', () => {
    component.clearNotification(1);
    expect(notificationService.clearNotification).toHaveBeenCalledWith(MOCK_USERS[0].id, 1);
  });

  it('should navigate to item when notification is clicked', () => {
    component.goToItem(mockNotifications[0]);
    expect(router.navigate).toHaveBeenCalledWith(['/items', mockNotifications[0].itemId]);
  });

  it('should calculate unread count', (done) => {
    component.unreadCount$.subscribe(count => {
      expect(count).toBe(1);
      done();
    });
  });
});