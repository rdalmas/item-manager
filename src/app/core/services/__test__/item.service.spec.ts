import { TestBed } from '@angular/core/testing';
import { ItemService } from '../item.service';
import { StorageService } from '../storage.service';
import { UserService } from '../user.service';
import { ProposalService } from '../proposal.service';
import { FilterService } from '../filter.service';
import { BehaviorSubject, of } from 'rxjs';
import { MOCK_ITEMS, MOCK_USERS } from '../../../../test/mock';
import { Item } from '../../models/item.interface';

describe('ItemService', () => {
  let service: ItemService;
  let storageService: jasmine.SpyObj<StorageService>;
  let userService: jasmine.SpyObj<UserService>;
  let proposalService: jasmine.SpyObj<ProposalService>;
  let filterService: jasmine.SpyObj<FilterService>;

  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['getItem', 'setItem']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getCurrentUser', 'getCurrentUserSync']);
    const proposalServiceSpy = jasmine.createSpyObj('ProposalService', ['getProposals']);
    const filterServiceSpy = jasmine.createSpyObj('FilterService', ['getFilters']);

    TestBed.configureTestingModule({
      providers: [
        ItemService,
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: ProposalService, useValue: proposalServiceSpy },
        { provide: FilterService, useValue: filterServiceSpy }
      ]
    });

    service = TestBed.inject(ItemService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    proposalService = TestBed.inject(ProposalService) as jasmine.SpyObj<ProposalService>;
    filterService = TestBed.inject(FilterService) as jasmine.SpyObj<FilterService>;

    // Setup spy returns
    storageService.getItem.and.returnValue(MOCK_ITEMS);
    userService.getCurrentUser.and.returnValue(of(MOCK_USERS[0]));
    userService.getCurrentUserSync.and.returnValue(MOCK_USERS[0]);
    proposalService.getProposals.and.returnValue(of([]));
    filterService.getFilters.and.returnValue(of({ search: '', sortBy: 'name', sortDirection: 'asc' }));

    // Initialize service
    service['items$'] = new BehaviorSubject<Item[]>(MOCK_ITEMS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get items by party', (done) => {
    service.getItemsByParty(MOCK_USERS[0].partyId).subscribe(items => {
      expect(items[0].ownerIds).toContain(MOCK_USERS[0].partyId);
      done();
    });
  });

  it('should get item by id', (done) => {
    service.getItemById(MOCK_ITEMS[0].id).subscribe(item => {
      expect(item).toEqual(MOCK_ITEMS[0]);
      done();
    });
  });

  it('should get filtered items', (done) => {
    service.getFilteredItems().subscribe(items => {
      expect(items).toBeTruthy();
      expect(Array.isArray(items)).toBeTrue();
      done();
    });
  });

  it('should check if item has proposals', (done) => {
    service.hasProposals(MOCK_ITEMS[0].id).subscribe(hasProposals => {
      expect(typeof hasProposals).toBe('boolean');
      done();
    });
  });
});