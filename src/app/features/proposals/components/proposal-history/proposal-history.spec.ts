import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { ProposalHistoryComponent } from './proposal-history.component';
import { ProposalService } from '../../../../core/services/proposal.service';
import { UserService } from '../../../../core/services/user.service';
import { MOCK_ITEMS, MOCK_USERS } from '../../../../../test/mock';

describe('ProposalHistoryComponent', () => {
  let component: ProposalHistoryComponent;
  let fixture: ComponentFixture<ProposalHistoryComponent>;
  let proposalService: jasmine.SpyObj<ProposalService>;
  let userService: jasmine.SpyObj<UserService>;

  const mockProposals = [
    {
      id: 1,
      itemId: MOCK_ITEMS[0].id,
      itemName: MOCK_ITEMS[0].name,
      ratios: [
        { partyId: 1, percentage: 60 },
        { partyId: 2, percentage: 40 }
      ],
      createdBy: 1,
      createdDate: new Date(),
      status: 'pending' as 'pending',
      partyAcceptances: []
    }
  ];

  beforeEach(async () => {
    const proposalServiceSpy = jasmine.createSpyObj('ProposalService', [
      'getProposalsByItem',
      'acceptProposal',
      'withdrawProposal'
    ]);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getCurrentUser']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatChipsModule,
        ProposalHistoryComponent
      ],
      providers: [
        { provide: ProposalService, useValue: proposalServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { params: new BehaviorSubject({ itemId: '1' }) }
        }
      ]
    }).compileComponents();

    proposalService = TestBed.inject(ProposalService) as jasmine.SpyObj<ProposalService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  beforeEach(() => {
    proposalService.getProposalsByItem.and.returnValue(of(mockProposals));
    userService.getCurrentUser.and.returnValue(of(MOCK_USERS[0]));

    fixture = TestBed.createComponent(ProposalHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle component destruction', () => {
    const unsubscribeSpy = spyOn(component['destroy$'], 'next');
    const completeSpy = spyOn(component['destroy$'], 'complete');
    
    component.ngOnDestroy();
    
    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should fetch current user on init', () => {
    component.ngOnInit();
    expect(userService.getCurrentUser).toHaveBeenCalled();
  });

  it('should fetch proposals on init', () => {
    component.ngOnInit();
    expect(proposalService.getProposalsByItem).toHaveBeenCalledWith(MOCK_ITEMS[0].id);
  });
});