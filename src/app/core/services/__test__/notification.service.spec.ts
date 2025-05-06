import { TestBed } from '@angular/core/testing';
import { NotificationService } from '../notification.service';
import { StorageService } from '../storage.service';
import { UserService } from '../user.service';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { BehaviorSubject, of } from 'rxjs';
import { MOCK_USERS } from '../../../../test/mock';
import { Notification } from '../../models/notification.interface';

describe('NotificationService', () => {
  let service: NotificationService;
  let storageService: jasmine.SpyObj<StorageService>;
  let userService: jasmine.SpyObj<UserService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockNotifications: Notification[] = [
    {
      id: 1,
      message: 'Test notification',
      type: 'info',
      timestamp: new Date(),
      read: false,
      partyId: MOCK_USERS[0].partyId,
      itemId: 1
    }
  ];

  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['getItem', 'setItem']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUsers']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const snackBarRefSpy = jasmine.createSpyObj<MatSnackBarRef<any>>(['afterDismissed']);
    snackBarRefSpy.afterDismissed.and.returnValue(of({ dismissedByAction: false }));

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    });

    service = TestBed.inject(NotificationService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    // Setup spy returns
    storageService.getItem.and.returnValue(mockNotifications);
    userService.getUsers.and.returnValue(of(MOCK_USERS));
    snackBar.open.and.returnValue(snackBarRefSpy);

    // Initialize service
    service['notifications$'] = new BehaviorSubject<Notification[]>(mockNotifications);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get notifications by user', (done) => {
    service.getNotificationsByUser(MOCK_USERS[0].id).subscribe(notifications => {
      expect(notifications).toEqual(mockNotifications);
      expect(notifications[0].partyId).toBe(MOCK_USERS[0].partyId);
      done();
    });
  });

  it('should mark notification as read', () => {
    service.markAsRead(mockNotifications[0].id);
    
    const notifications = service['notifications$'].value;
    expect(notifications[0].read).toBeTrue();
    expect(storageService.setItem).toHaveBeenCalled();
  });

  it('should clear notification', () => {
    service.clearNotification(MOCK_USERS[0].id, mockNotifications[0].id);
    
    const notifications = service['notifications$'].value;
    expect(notifications[0].clearedBy).toContain(MOCK_USERS[0].id);
    expect(storageService.setItem).toHaveBeenCalled();
  });

  it('should create proposal notification', () => {
    service.notifyProposalAction('PROPOSAL_CREATED', {
      itemId: 1,
      itemName: 'Test Item',
      partyIds: [MOCK_USERS[0].partyId]
    });

    expect(snackBar.open).toHaveBeenCalled();
    expect(storageService.setItem).toHaveBeenCalled();
  });

  it('should load notifications on init', () => {
    expect(storageService.getItem).toHaveBeenCalledWith('notifications');
    expect(service['notifications$'].value).toEqual(mockNotifications);
  });
});