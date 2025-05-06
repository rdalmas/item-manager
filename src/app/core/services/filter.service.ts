import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FilterCriteria {
  search: string;
  sortBy: 'name' | 'date' | 'status';
  sortDirection: 'asc' | 'desc';
  hasProposals?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filters$ = new BehaviorSubject<FilterCriteria>({
    search: '',
    sortBy: 'name',
    sortDirection: 'asc',
    hasProposals: undefined
  });

  getFilters(): Observable<FilterCriteria> {
    return this.filters$.asObservable();
  }

  setFilters(filters: Partial<FilterCriteria>): void {
    this.filters$.next({
      ...this.filters$.value,
      ...filters
    });
  }

  resetFilters(): void {
    this.filters$.next({
      search: '',
      sortBy: 'name',
      sortDirection: 'asc',
      hasProposals: undefined
    });
  }
}