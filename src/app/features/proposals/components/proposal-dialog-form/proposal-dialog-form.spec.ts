import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProposalFormDialogComponent } from './proposal-dialog-form.component';
import { ProposalService } from '../../../../core/services/proposal.service';
import { UserService } from '../../../../core/services/user.service';
import { MOCK_ITEMS, MOCK_USERS } from '../../../../../test/mock';
import { of } from 'rxjs';

describe('ProposalFormDialogComponent', () => {
  let component: ProposalFormDialogComponent;
  let fixture: ComponentFixture<ProposalFormDialogComponent>;
  let proposalService: jasmine.SpyObj<ProposalService>;
  let userService: jasmine.SpyObj<UserService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ProposalFormDialogComponent>>;

  const mockDialogData = {
    item: MOCK_ITEMS[0],
    isCounter: false
  };

  beforeEach(async () => {
    const proposalServiceSpy = jasmine.createSpyObj('ProposalService', ['createProposal']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getCurrentUser']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        ProposalFormDialogComponent
      ],
      providers: [
        { provide: ProposalService, useValue: proposalServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    proposalService = TestBed.inject(ProposalService) as jasmine.SpyObj<ProposalService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<ProposalFormDialogComponent>>;
  });

  beforeEach(() => {
    userService.getCurrentUser.and.returnValue(of(MOCK_USERS[0]));
    proposalService.createProposal.and.returnValue(of({
      id: 1,
      itemId: 1,
      itemName: 'Test Item',
      ratios: [
        { partyId: 1, percentage: 50 },
        { partyId: 2, percentage: 50 }
      ],
      createdBy: 1,
      createdDate: new Date(),
      status: 'pending',
      partyAcceptances: []
    }));

    fixture = TestBed.createComponent(ProposalFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with party ratios', () => {
    expect(component.proposalForm.get('ratios')).toBeTruthy();
    expect(component.proposalForm.get('message')).toBeTruthy();
  });

  it('should validate total percentage equals 100', () => {
    // Set initial form values with 90% total
    component.proposalForm.patchValue({
      ratios: [
        { partyId: 1, percentage: 60 },
        { partyId: 2, percentage: 30 }
      ],
      message: ''
    });
  
    // Check invalid state (90%)
    const ratiosArray = component.proposalForm.get('ratios');
    expect(ratiosArray?.hasError('totalPercentage')).toBeTrue();
    expect(component.proposalForm.valid).toBeFalse();
    
    // Update to valid percentages (100%)
    component.proposalForm.patchValue({
      ratios: [
        { partyId: 1, percentage: 60 },
        { partyId: 2, percentage: 40 }
      ]
    });
  
    // Check valid state
    expect(ratiosArray?.hasError('totalPercentage')).toBeFalse();
    expect(component.proposalForm.valid).toBeTrue();
});

  it('should submit proposal when form is valid', () => {
    component.proposalForm.setValue({
      ratios: [
        { partyId: 1, percentage: 50 },
        { partyId: 2, percentage: 50 }
      ],
      message: 'Test proposal'
    });

    component.onSubmit();

    expect(proposalService.createProposal).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should not submit when form is invalid', () => {
    component.proposalForm.setValue({
      ratios: [
        { partyId: 1, percentage: 60 },
        { partyId: 2, percentage: 30 }
      ],
      message: 'Test proposal'
    });

    component.onSubmit();

    expect(proposalService.createProposal).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});