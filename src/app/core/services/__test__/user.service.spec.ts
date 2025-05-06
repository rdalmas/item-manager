import { TestBed } from '@angular/core/testing';
import { UserService } from '../user.service';
import { StorageService } from '../storage.service';
import { MOCK_USERS } from '../../../../test/mock';

describe('UserService', () => {
  let service: UserService;
  let storageService: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['getItem', 'setItem']);
    storageServiceSpy.getItem.and.callFake((key: string) => {
      if (key === 'users') return MOCK_USERS;
      if (key === 'lastUserId') return MOCK_USERS[0].id;
      return null;
    });

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: StorageService, useValue: storageServiceSpy }
      ]
    });

    service = TestBed.inject(UserService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load users from storage on init', () => {
    expect(storageService.getItem).toHaveBeenCalledWith('users');
    expect(service['users']).toEqual(MOCK_USERS);
  });

  it('should restore last selected user from storage', () => {
    expect(storageService.getItem).toHaveBeenCalledWith('lastUserId');
    expect(service.getCurrentUserSync()).toEqual(MOCK_USERS[0]);
  });

  it('should set current user', (done) => {
    const newUser = MOCK_USERS[1];
    service.setCurrentUser(newUser);

    service.getCurrentUser().subscribe(user => {
      expect(user).toEqual(newUser);
      expect(storageService.setItem).toHaveBeenCalledWith('lastUserId', newUser.id);
      done();
    });
  });

  it('should check if user is in party', () => {
    const result = service.isUserInParty(MOCK_USERS[0].id, MOCK_USERS[0].partyId);
    expect(result).toBeTrue();
  });

  it('should get party users', () => {
    const partyUsers = service.getPartyUsers(MOCK_USERS[0].partyId);
    expect(partyUsers.every(u => u.partyId === MOCK_USERS[0].partyId)).toBeTrue();
  });

  it('should get all users', (done) => {
    service.getUsers().subscribe(users => {
      expect(users).toEqual(MOCK_USERS);
      done();
    });
  });

  it('should get current user party members', (done) => {
    service.setCurrentUser(MOCK_USERS[0]);
    
    service.getCurrentUserPartyMembers().subscribe(members => {
      expect(members.every(m => m.partyId === MOCK_USERS[0].partyId)).toBeTrue();
      done();
    });
  });

  it('should get user name by party', () => {
    const userName = service.getUserNameByParty(MOCK_USERS[0].id, MOCK_USERS[0].partyId);
    expect(userName).toBe(MOCK_USERS[0].name);
  });

  it('should handle user not found when getting name by party', () => {
    const userName = service.getUserNameByParty(999, MOCK_USERS[0].partyId);
    expect(userName).toBeUndefined();
  });
});