import { TestBed } from '@angular/core/testing';
import { ProposalService } from '../proposal.service';
import { UserService } from '../user.service';
import { NotificationService } from '../notification.service';
import { StorageService } from '../storage.service';
import { BehaviorSubject, of } from 'rxjs';
import { MOCK_USERS, MOCK_ITEMS } from '../../../../test/mock';
import { Proposal } from '../../models/proposal.interface';

describe('ProposalService', () => {
  let service: ProposalService;
  let userService: jasmine.SpyObj<UserService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let storageService: jasmine.SpyObj<StorageService>;

  const mockProposals: Proposal[] = [
    {
      id: 1,
      itemId: MOCK_ITEMS[0].id,
      itemName: MOCK_ITEMS[0].name,
      ratios: [
        { partyId: 1, percentage: 60 },
        { partyId: 2, percentage: 40 }
      ],
      createdBy: MOCK_USERS[0].id,
      createdDate: new Date(),
      status: 'pending',
      partyAcceptances: []
    }
  ];

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', [
      'getCurrentUser',
      'getCurrentUserSync',
      'getUsers',
      'isUserInParty'
    ]);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', 
      ['notifyProposalAction']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', 
      ['getItem', 'setItem']);

    TestBed.configureTestingModule({
      providers: [
        ProposalService,
        { provide: UserService, useValue: userServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy }
      ]
    });

    service = TestBed.inject(ProposalService);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;

    // Setup spy returns
    userService.getCurrentUser.and.returnValue(of(MOCK_USERS[0]));
    userService.getCurrentUserSync.and.returnValue(MOCK_USERS[0]);
    userService.getUsers.and.returnValue(of(MOCK_USERS));
    userService.isUserInParty.and.returnValue(true);
    storageService.getItem.and.returnValue(mockProposals);

    // Initialize service
    service['proposals$'] = new BehaviorSubject(mockProposals);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a proposal', (done) => {
    const newProposal = {
      itemId: MOCK_ITEMS[0].id,
      itemName: MOCK_ITEMS[0].name,
      ratios: [
        { partyId: 1, percentage: 60 },
        { partyId: 2, percentage: 40 }
      ]
    };

    service.createProposal(newProposal).subscribe(() => {
      expect(notificationService.notifyProposalAction)
        .toHaveBeenCalledWith('PROPOSAL_CREATED', jasmine.any(Object));
      done();
    });
  });

  it('should get proposals by item', (done) => {
    service.getProposalsByItem(MOCK_ITEMS[0].id).subscribe(proposals => {
      expect(proposals).toEqual(mockProposals);
      expect(proposals[0].itemId).toBe(MOCK_ITEMS[0].id);
      done();
    });
  });

  it('should accept a proposal', (done) => {
    service.acceptProposal(mockProposals[0].id).subscribe(() => {
      expect(notificationService.notifyProposalAction)
        .toHaveBeenCalledWith('PROPOSAL_ACCEPTED', jasmine.any(Object));
      done();
    });
  });

  it('should withdraw a proposal', (done) => {
    // Reset proposal status to pending before test
    const proposals = service['proposals$'].value;
    proposals[0].status = 'pending';
    service['proposals$'].next(proposals);
    
    service.withdrawProposal(mockProposals[0].id).subscribe(() => {
      // Verify the proposal was withdrawn
      expect(proposals[0].status).toBe('withdrawn');
      expect(proposals[0].withdrawnBy).toBe(MOCK_USERS[0].id);
      expect(proposals[0].withdrawnDate).toBeTruthy();
      done();
    });
});

  it('should check for counter proposals', () => {
    const hasCounter = service.hasCounterProposals(mockProposals[0].id);
    expect(hasCounter).toBeFalsy();
  });

  it('should get active proposal for item', (done) => {
    // Reset proposal status to pending before test
    const proposals = service['proposals$'].value;
    proposals[0].status = 'pending';
    service['proposals$'].next(proposals);
    
    service.getActiveProposal(MOCK_ITEMS[0].id).subscribe(proposal => {
      expect(proposal).toBeTruthy();
      expect(proposal?.status).toBe('pending');
      done();
    });
  });
});