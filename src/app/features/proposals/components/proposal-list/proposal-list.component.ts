import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Proposal } from '../../../../core/models/proposal.interface';
import { ProposalService } from '../../../../core/services/proposal.service';

@Component({
  selector: 'app-proposal-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './proposal-list.component.html',
  styleUrls: ['./proposal-list.component.scss']
})
export class ProposalListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['itemName', 'createdDate', 'status', 'totalParties', 'actions'];
  proposals: Proposal[] = [];
  private destroy$ = new Subject<void>();

  constructor(private proposalService: ProposalService) {}

  ngOnInit(): void {
    this.proposalService.getProposals()
      .pipe(takeUntil(this.destroy$))
      .subscribe(proposals => {
        this.proposals = proposals;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}