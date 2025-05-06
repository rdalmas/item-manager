import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { EMPTY, map, Subject, switchMap, takeUntil, withLatestFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Item } from '../../../../core/models/item.interface';
import { ItemService } from '../../../../core/services/item.service';
import { UserService } from '../../../../core/services/user.service';
import { OwnerService } from '../../../../core/services/owner.service';
import { ProposalFormDialogComponent } from '../../../proposals/components/proposal-dialog-form/proposal-dialog-form.component';
import { ProposalService } from '../../../../core/services/proposal.service';
import { FilterComponent } from '../../../../shared/components/filter/filter.component';
import { FilterService } from '../../../../core/services/filter.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, FilterComponent, MatSortModule, MatIconModule, MatButtonModule, MatTooltipModule, RouterModule],
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['name', 'description', 'parties', 'hasProposals', 'actions'];
  items: Item[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    public itemService: ItemService,
    private userService: UserService,
    private ownerService: OwnerService,
    private proposalService: ProposalService,
    private filterService: FilterService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  private loadItems(): void {
    this.userService.getCurrentUser().pipe(
        takeUntil(this.destroy$),
        switchMap(user => {
            if (!user) return EMPTY;
            // Replace with getFilteredItems() to use the filter service data
            return this.itemService.getFilteredItems().pipe(
                // Filter for current user's party
                map(items => items.filter(item => item.ownerIds.includes(user.partyId))),
                // Add hasProposals flag to each item
                withLatestFrom(this.proposalService.getProposals()),
                map(([items, proposals]) => items.map(item => ({
                    ...item,
                    hasProposals: proposals
                        .filter(p => p.status === 'pending')
                        .some(p => p.itemId === item.id)
                })))
            );
        })
    ).subscribe(items => {
        this.items = items;
    });
  }

  getPartiesCount(item: Item): number {
    return item.ownerIds?.length || 0;
  }

  canCreateProposal(item: Item): boolean {
    return item.ownerIds.length > 1 && !item.hasProposals;
  }

  createProposal(item: Item): void {
    const dialogRef = this.dialog.open(ProposalFormDialogComponent, {
      data: {
        item,
        isCounter: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh items list if proposal was created
        this.loadItems();
      }
    });
  }

  getPartyNames(item: Item): string {
    return `[${item.ownerIds
      .map(id => this.ownerService.getOwnerName(id))
      .filter(name => name) // Remove any undefined/null values
      .join(', ')}]`;
  }

  onSortData(sort: Sort): void {
    // Use the filter service to set the sort criteria instead of handling it internally
    this.filterService.setFilters({
        sortBy: sort.active as 'name' | 'date' | 'status',
        sortDirection: sort.direction as 'asc' | 'desc'
    });
  }

  viewDetails(itemId: number): void {
    this.router.navigate(['/items', itemId]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}