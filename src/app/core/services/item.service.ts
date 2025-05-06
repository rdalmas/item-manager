import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, switchMap } from 'rxjs';
import { map } from 'rxjs';
import { Item } from '../models/item.interface';
import { StorageService } from './storage.service';
import { FilterCriteria, FilterService } from './filter.service';
import { UserService } from './user.service';
import { ProposalService } from './proposal.service';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
    private items$ = new BehaviorSubject<Item[]>([]);
    private readonly STORAGE_KEY = 'items';
    constructor(
        private storageService: StorageService,
        private filterService: FilterService,
        private userService: UserService,
        private proposalService: ProposalService
    ) {
        this.loadItems();
    }

    private loadItems(): void {
        const storedItems = this.storageService.getItem<Item[]>(this.STORAGE_KEY);
        if (storedItems) {
            this.items$.next(storedItems);
        } else {
            fetch('assets/data/items.json')
                .then(response => response.json())
                .then((items: Item[]) => {
                    items.forEach(item => item.lastModified = new Date());
                    this.storageService.setItem(this.STORAGE_KEY, items);
                    this.items$.next(items);
                });
        }
    }

    getItems(): Observable<Item[]> {
        return this.items$.asObservable();
    }

    private checkIfActionRequired(item: Item, proposals: any[], partyId?: number): boolean {
        if (!partyId || !item.ownerIds.includes(partyId)) return false;
        
        const itemProposals = proposals.filter(p => p.itemId === item.id);
        if (!itemProposals.length) return false;

        const latestProposal = itemProposals[itemProposals.length - 1];
        return !latestProposal.partyAcceptances.some((a: any) => a.partyId === partyId);
    }

    getItemsByParty(partyId: number): Observable<Item[]> {
        return this.items$.pipe(
            map(items => items.filter(item => item.ownerIds.includes(partyId))),
            switchMap(items => 
                combineLatest([
                    this.proposalService.getProposals(),
                    this.userService.getCurrentUser()
                ]).pipe(
                    map(([proposals, user]) => {
                        return items.map(item => ({
                            ...item,
                            hasProposals: proposals.some(p => p.itemId === item.id),
                            isShared: item.ownerIds.length > 1,
                            hasActionRequired: this.checkIfActionRequired(item, proposals, user?.partyId)
                        }));
                    })
                )
            )
        );
    }

    getItemById(id: number): Observable<Item | null> {
        return this.userService.getCurrentUser().pipe(
            switchMap(user => {
                if (!user) return new Observable<null>();
                
                return this.items$.pipe(
                    map(items => {
                        const item = items.find(i => i.id === id);
                        return item && item.ownerIds.includes(user.partyId) ? item : null;
                    })
                );
            })
        );
    }

    hasProposals(itemId: number): Observable<boolean> {
        return combineLatest([
            this.getItemById(itemId),
            this.proposalService.getProposals()
        ]).pipe(
            map(([item, proposals]) => {
                if (!item) return false;
                return proposals.some(proposal => proposal.itemId === item.id);
            })
        );
    }

    getFilteredItems(): Observable<Item[]> {
        return combineLatest([
            this.items$.asObservable(),
            this.filterService.getFilters()
        ]).pipe(
            map(([items, filters]) => this.applyFilters(items, filters))
        );
    }

    private applyFilters(items: Item[], filters: FilterCriteria): Item[] {
        let filteredItems = [...items];

        if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredItems = filteredItems.filter(item =>
            item.name.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower)
        );
        }

        if (filters.hasProposals !== undefined) {
            filteredItems = filteredItems.filter(item => {
                let hasProposals = false;
                this.hasProposals(item.id).subscribe(value => hasProposals = value);
                return hasProposals === filters.hasProposals;
            });
        }

        if (filters.sortBy) {
        filteredItems.sort((a, b) => {
            const direction = filters.sortDirection === 'desc' ? -1 : 1;
            switch (filters.sortBy) {
            case 'name':
                return a.name.localeCompare(b.name) * direction;
            case 'date':
                return ((a.lastModified?.getTime() ?? 0) - (b.lastModified?.getTime() ?? 0)) * direction;
            default:
                return 0;
            }
        });
        }

        return filteredItems;
    }
}