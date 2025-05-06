import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';
import { Item } from '../../../../core/models/item.interface';
import { Proposal } from '../../../../core/models/proposal.interface';
import { ItemService } from '../../../../core/services/item.service';
import { ProposalService } from '../../../../core/services/proposal.service';
import { OwnerService } from '../../../../core/services/owner.service';
import { UserService } from '../../../../core/services/user.service';
import { ProposalFormDialogComponent } from '../../../proposals/components/proposal-dialog-form/proposal-dialog-form.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    RouterModule
  ],
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss']
})
export class ItemDetailComponent implements OnInit, OnDestroy {
  item?: Item;
  activeProposal?: Proposal;
  canWithdraw = false;
  canAcceptOrCounter = false;
  private destroy$ = new Subject<void>();
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private itemService: ItemService,
    private proposalService: ProposalService,
    private ownerService: OwnerService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        const itemId = +params['id'];
        return combineLatest([
          this.itemService.getItemById(itemId).pipe(
            map(item => item ?? undefined)
          ),
          this.proposalService.getActiveProposal(itemId)
        ]);
      })
    ).subscribe(([item, proposal]) => {
      this.item = item;
      this.activeProposal = proposal;
      
      if (proposal) {
        this.checkPermissions(proposal);
      }
    });
  }

  private checkPermissions(proposal: Proposal): void {
    const currentUser = this.userService.getCurrentUserSync();
    if (!currentUser) return;

    // Can withdraw if user is from proposing party and proposal is pending
    this.canWithdraw = 
      proposal.createdBy === currentUser.id && 
      proposal.status === 'pending' &&
      !this.proposalService.hasCounterProposals(proposal.id);


    // Can accept/counter if user is from other party and proposal is pending
    this.canAcceptOrCounter = 
      proposal.ratios.some(r => r.partyId === currentUser.partyId) && 
      proposal.createdBy !== currentUser.id &&
      proposal.status === 'pending';
  }

  acceptProposal(): void {
    if (!this.activeProposal || !this.item) return;

    this.proposalService.acceptProposal(this.activeProposal.id)
      .subscribe(() => {
        // Notify other parties about the acceptance
        const otherParties = this.item!.ownerIds.filter(id => 
          id !== this.userService.getCurrentUserSync()?.partyId
        );
        
        otherParties.forEach(partyId => {
          this.notificationService.notifyProposalAction('PROPOSAL_ACCEPTED', {
            itemId: this.item!.id,
            itemName: this.item!.name,
            partyIds: [partyId],
          });
        });

        this.router.navigate(['/items']);
      });
  }

  rejectWithCounter(): void {
    if (!this.item || !this.activeProposal) return;

    const dialogRef = this.dialog.open(ProposalFormDialogComponent, {
      data: {
        item: this.item,
        isCounter: true,
        previousProposalId: this.activeProposal.id,
        initialRatios: this.activeProposal.ratios
      },
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const otherParties = this.item!.ownerIds.filter(id => 
          id !== this.userService.getCurrentUserSync()?.partyId
        );
        
        otherParties.forEach(partyId => {
          this.notificationService.notifyProposalAction('PROPOSAL_COUNTERED', {
            itemId: this.item!.id,
            partyIds: [partyId],
            itemName: this.item!.name
          });
        });

        this.router.navigate(['/items']);
      }
    });
  }

  withdrawProposal(): void {
    if (!this.activeProposal || !this.item) return;

    this.proposalService.withdrawProposal(this.activeProposal.id)
      .subscribe(() => {
        // Notify other parties about the withdrawal
        const otherParties = this.item!.ownerIds.filter(id => 
          id !== this.userService.getCurrentUserSync()?.partyId
        );
        
        otherParties.forEach(partyId => {
          this.notificationService.notifyProposalAction('PROPOSAL_WITHDRAWN', {
            itemId: this.item!.id,
            itemName: this.item!.name,
            partyIds: [partyId]
          });
        });

        this.router.navigate(['/items']);
      });
  }

  viewHistory(): void {
    if (this.item) {
      this.router.navigate(['/proposals/item', this.item.id]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}