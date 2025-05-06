import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { UserSwitcherComponent } from './user-switcher.component';
import { UserService } from '../../../../core/services/user.service';
import { MOCK_USERS } from '../../../../../test/mock';
import { of } from 'rxjs';

describe('UserSwitcherComponent', () => {
  let component: UserSwitcherComponent;
  let fixture: ComponentFixture<UserSwitcherComponent>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', [
      'getUsers',
      'getCurrentUser',
      'setCurrentUser'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatSelectModule,
        MatFormFieldModule,
        FormsModule,
        UserSwitcherComponent
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  beforeEach(() => {
    userService.getUsers.and.returnValue(of(MOCK_USERS));
    userService.getCurrentUser.and.returnValue(of(MOCK_USERS[0]));
    userService.setCurrentUser.and.returnValue(undefined);

    fixture = TestBed.createComponent(UserSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users and set initial selection on init', () => {
    expect(component.users).toEqual(MOCK_USERS);
    expect(component.selectedUserId).toBe(MOCK_USERS[0].id);
    expect(userService.getUsers).toHaveBeenCalled();
    expect(userService.getCurrentUser).toHaveBeenCalled();
  });

  it('should handle user change', () => {
    component.selectedUserId = MOCK_USERS[1].id;
    component.onUserChange();
    
    expect(userService.setCurrentUser).toHaveBeenCalledWith(MOCK_USERS[1]);
  });

  it('should not call setCurrentUser when no user is selected', () => {
    component.selectedUserId = null;
    component.onUserChange();
    
    expect(userService.setCurrentUser).not.toHaveBeenCalled();
  });

  it('should set first user as current when no current user exists', () => {
    userService.getCurrentUser.and.returnValue(of(null));
    component.ngOnInit();
    
    expect(component.selectedUserId).toBe(MOCK_USERS[0].id);
    expect(userService.setCurrentUser).toHaveBeenCalledWith(MOCK_USERS[0]);
  });
});