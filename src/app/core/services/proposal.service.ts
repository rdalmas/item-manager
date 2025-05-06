import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Proposal } from '../models/proposal.interface';
import { StorageService } from './storage.service';
import { UserService } from './user.service';
import { NotificationService } from './notification.service';

interface CreateProposalOptions {
    itemId: number;
    itemName: string;
    ratios: { partyId: number; percentage: number; }[];
    message?: string;
    isCounterProposal?: boolean;
    previousProposalId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProposalService {
  private proposals$ = new BehaviorSubject<Proposal[]>([]);
  private readonly STORAGE_KEY = 'proposals';

  constructor(
    private storageService: StorageService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    this.loadProposals();
  }

  hasCounterProposals(proposalId: number): boolean {
    return this.proposals$.value.some(p => p.previousProposalId === proposalId);
  }

  getProposals(): Observable<Proposal[]> {
    return this.proposals$.asObservable();
  }

  private loadProposals(): void {
    const storedProposals = this.storageService.getItem<Proposal[]>(this.STORAGE_KEY);
    
    if (storedProposals && Array.isArray(storedProposals) && storedProposals.length > 0) {
      const proposals = storedProposals.map(p => ({
        ...p,
        createdDate: new Date(p.createdDate),
        partyAcceptances: p.partyAcceptances.map(pa => ({
          ...pa,
          date: pa.date ? new Date(pa.date) : new Date()
        }))
      }));
      this.proposals$.next(proposals);
    }
  }

  getProposalsByItem(itemId: number): Observable<Proposal[]> {
    return this.proposals$.pipe(
      map(proposals => proposals.filter(p => p.itemId === itemId))
    );
  }

  getActiveProposal(itemId: number): Observable<Proposal | undefined> {
    return this.proposals$.pipe(
      map(proposals => {
        const itemProposals = proposals
          .filter(p => p.itemId === itemId && p.status === 'pending')
          .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
        return itemProposals[0];
      })
    );
  }

  createProposal(options: CreateProposalOptions): Observable<Proposal> {
    if (options.isCounterProposal && !options.message) {
      throw new Error('Counter proposals require a message');
    }

    const currentUser = this.userService.getCurrentUserSync();
    if (!currentUser) {
      throw new Error('No user is currently logged in');
    }

    const newProposal: Proposal = {
      id: this.getNextId(),
      itemId: options.itemId,
      itemName: options.itemName,
      ratios: options.ratios,
      message: options.message,
      createdBy: currentUser.id,
      createdDate: new Date(),
      status: 'pending',
      partyAcceptances: [],
      previousProposalId: options.previousProposalId
    };

    if (options.previousProposalId) {
      const previousProposal = this.proposals$.value
        .find(p => p.id === options.previousProposalId);
      if (previousProposal) {
        previousProposal.status = 'countered';
      }
    }

    const proposals = [...this.proposals$.value, newProposal];
    this.storageService.setItem(this.STORAGE_KEY, proposals);
    this.proposals$.next(proposals);

    // Notify all target parties (not just one per party)
    const targetParties = options.ratios
      .map(r => r.partyId)
      .filter(partyId => partyId !== currentUser.partyId);

    this.notificationService.notifyProposalAction('PROPOSAL_CREATED', {
      itemId: options.itemId,
      itemName: options.itemName,
      partyIds: targetParties
    });

    return new Observable<Proposal>(observer => {
      observer.next(newProposal);
      observer.complete();
    });
  }

  acceptProposal(proposalId: number): Observable<void> {
    const currentUser = this.userService.getCurrentUserSync();
    if (!currentUser) {
      throw new Error('No user is currently logged in');
    }

    const proposals = this.proposals$.value;
    const proposal = proposals.find(p => p.id === proposalId);

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // Update the proposal status to 'accepted'
    proposal.status = 'accepted';
    proposal.partyAcceptances.push({
      partyId: currentUser.partyId,
      accepted: true,
      date: new Date()
    });

    // Save changes
    this.storageService.setItem(this.STORAGE_KEY, proposals);
    this.proposals$.next(proposals);

    // Notify proposing party about acceptance
    const proposingUser = this.userService.getUsers()
      .pipe(map(users => users.find(u => u.id === proposal.createdBy)));

    proposingUser.subscribe(user => {
      if (user) {
        this.notificationService.notifyProposalAction('PROPOSAL_ACCEPTED', {
          itemId: proposal.itemId,
          itemName: proposal.itemName || '',
          partyIds: [user.partyId]
        });
      }
    });

    // Notify other parties about acceptance (except accepting party and proposing party)
    const otherParties = proposal.ratios
      .map(r => r.partyId)
      .filter(partyId => 
        partyId !== currentUser.partyId && 
        partyId !== proposal.createdBy
      );

    if (otherParties.length > 0) {
      this.notificationService.notifyProposalAction('PROPOSAL_ACCEPTED_BY_PARTY', {
        itemId: proposal.itemId,
        itemName: proposal.itemName || '',
        partyIds: otherParties
      });
    }

    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
}

  hasProposals(itemId: number): Observable<boolean> {
    return this.getProposals().pipe(
        map(proposals => proposals
            .filter(p => p.status === 'pending')
            .some(p => p.itemId === itemId)
        )
    );
  }

  getItemProposalStatus(itemId: number, partyId: number): Observable<{
      hasProposals: boolean;
      hasActionRequired: boolean;
  }> {
      return this.getProposals().pipe(
          map(proposals => {
              const activeProposal = proposals
                  .filter(p => p.itemId === itemId && p.status === 'pending')
                  .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())[0];

              return {
                  hasProposals: !!activeProposal,
                  hasActionRequired: activeProposal ? 
                      this.isActionRequired(activeProposal, partyId) : false
              };
          })
      );
  }

  private isActionRequired(proposal: Proposal, partyId: number): boolean {
      return proposal.ratios.some(r => r.partyId === partyId) && 
            !proposal.partyAcceptances.some(a => a.partyId === partyId);
  }

  withdrawProposal(proposalId: number): Observable<void> {
    const currentUser = this.userService.getCurrentUserSync();
    if (!currentUser) {
      throw new Error('No user is currently logged in');
    }

    const proposals = this.proposals$.value;
    const proposal = proposals.find(p => p.id === proposalId);

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.status !== 'pending') {
      throw new Error('Only pending proposals can be withdrawn');
    }

    proposal.status = 'withdrawn';
    proposal.withdrawnBy = currentUser.id;
    proposal.withdrawnDate = new Date();

    this.storageService.setItem(this.STORAGE_KEY, proposals);
    this.proposals$.next(proposals);

    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  canWithdrawProposal(proposal: Proposal): Observable<boolean> {
    return this.userService.getCurrentUser().pipe(
      map(user => {
        if (!user) return false;
        const isProposingParty = proposal.createdBy === user.id;
        const isPending = proposal.status === 'pending';
        const hasNoCounters = !this.hasCounterProposals(proposal.id);
        return isProposingParty && isPending && hasNoCounters;
      })
    );
  }

  canAcceptOrCounter(proposal: Proposal): Observable<boolean> {
    return this.userService.getCurrentUser().pipe(
      map(user => {
        if (!user) return false;
        const isCounterParty = proposal.ratios.some(r => r.partyId === user.partyId) && 
                              proposal.createdBy !== user.id;
        return isCounterParty && proposal.status === 'pending';
      })
    );
  }

  private getNextId(): number {
    const proposals = this.proposals$.value;
    return proposals.length > 0 
      ? Math.max(...proposals.map(p => p.id)) + 1 
      : 1;
  }
}