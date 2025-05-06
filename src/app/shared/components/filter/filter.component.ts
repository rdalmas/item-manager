import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { FilterService } from '../../../core/services/filter.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnDestroy {
  filters = {
    search: '',
    sortBy: 'name' as 'name' | 'date' | 'status' | undefined,
    sortDirection: 'asc' as 'asc' | 'desc',
    hasProposals: undefined as boolean | undefined
  };

  private destroy$ = new Subject<void>();

  constructor(private filterService: FilterService) {
  }

  ngOnInit(): void {
    this.filterService.getFilters()
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        this.filters = { ...this.filters, ...filters };
      });
  }

  onFilterChange(): void {
    this.filterService.setFilters(this.filters);
  }

  clearSearch(): void {
    this.filters.search = '';
    this.onFilterChange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}