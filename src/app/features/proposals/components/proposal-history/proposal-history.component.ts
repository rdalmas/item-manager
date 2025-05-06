import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { combineLatest, Subject, switchMap, takeUntil } from 'rxjs';
import { Proposal } from '../../../../core/models/proposal.interface';
import { ProposalService } from '../../../../core/services/proposal.service';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-proposal-history',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule, MatChipsModule],
  templateUrl: './proposal-history.component.html',
  styleUrls: ['./proposal-history.component.scss']
})

export class ProposalHistoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @Input() itemId!: number;
  proposals: Proposal[] = [];
  currentPartyId?: number;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private proposalService: ProposalService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.itemId = +params['itemId'];
        
        return combineLatest([
          this.userService.getCurrentUser(),
          this.proposalService.getProposalsByItem(this.itemId)
        ]);
      })
    ).subscribe({
      next: ([user, proposals]) => {
        if (user) {
          this.currentPartyId = user.partyId;
          this.proposals = proposals;
        }
      },
      error: (error) => console.error('Error loading data:', error)
    });
  }
}