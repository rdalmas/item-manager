import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { ItemDetailComponent } from './item-detail.component';
import { ItemService } from '../../../../core/services/item.service';
import { ProposalService } from '../../../../core/services/proposal.service';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { MOCK_ITEMS, MOCK_USERS } from '../../../../../test/mock';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

describe('ItemDetailComponent', () => {
  let component: ItemDetailComponent;
  let fixture: ComponentFixture<ItemDetailComponent>;
  let itemService: jasmine.SpyObj<ItemService>;
  let proposalService: jasmine.SpyObj<ProposalService>;
  let userService: jasmine.SpyObj<UserService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockProposal = {
    id: 1,
    itemId: 1,
    itemName: 'Test Item',
    ratios: [
      { partyId: 1, percentage: 50 },
      { partyId: 2, percentage: 50 }
    ],
    createdBy: 1,
    createdDate: new Date(),
    status: 'pending' as 'pending',
    partyAcceptances: []
  };

  beforeEach(async () => {
    const itemServiceSpy = jasmine.createSpyObj('ItemService', ['getItemById']);
    const proposalServiceSpy = jasmine.createSpyObj('ProposalService', [
      'getActiveProposal',
      'acceptProposal',
      'withdrawProposal',
      'hasCounterProposals'
    ]);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getCurrentUserSync']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['notifyProposalAction']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatCardModule,
        MatIconModule,
        MatChipsModule,
        MatDividerModule,
        MatButtonModule,
        ItemDetailComponent  // Add component to imports instead of declarations
      ],
      providers: [
        { provide: ItemService, useValue: itemServiceSpy },
        { provide: ProposalService, useValue: proposalServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject({ id: 1 })
          }
        }
      ]
    }).compileComponents();

    itemService = TestBed.inject(ItemService) as jasmine.SpyObj<ItemService>;
    proposalService = TestBed.inject(ProposalService) as jasmine.SpyObj<ProposalService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  beforeEach(() => {
    itemService.getItemById.and.returnValue(of(MOCK_ITEMS[0]));
    proposalService.getActiveProposal.and.returnValue(of(mockProposal));
    userService.getCurrentUserSync.and.returnValue(MOCK_USERS[0]);
    proposalService.hasCounterProposals.and.returnValue(false);

    fixture = TestBed.createComponent(ItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load item and active proposal on init', () => {
    expect(component.item).toEqual(MOCK_ITEMS[0]);
    expect(component.activeProposal).toEqual(mockProposal);
  });

  it('should check permissions when active proposal exists', () => {
    expect(component.canWithdraw).toBeTruthy();
    expect(component.canAcceptOrCounter).toBeFalsy();
  });

  it('should handle proposal withdrawal', () => {
    proposalService.withdrawProposal.and.returnValue(of(void 0));
    
    component.withdrawProposal();

    expect(proposalService.withdrawProposal).toHaveBeenCalledWith(mockProposal.id);
    expect(notificationService.notifyProposalAction).toHaveBeenCalledWith(
      'PROPOSAL_WITHDRAWN',
      jasmine.any(Object)
    );
  });

  it('should handle proposal acceptance', () => {
    proposalService.acceptProposal.and.returnValue(of(void 0));
    
    component.acceptProposal();

    expect(proposalService.acceptProposal).toHaveBeenCalledWith(mockProposal.id);
    expect(notificationService.notifyProposalAction).toHaveBeenCalledWith(
      'PROPOSAL_ACCEPTED',
      jasmine.any(Object)
    );
  });
});