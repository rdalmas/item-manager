import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemListComponent } from './item-list.component';
import { ItemService } from '../../../../core/services/item.service';
import { UserService } from '../../../../core/services/user.service';
import { OwnerService } from '../../../../core/services/owner.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { MOCK_ITEMS, MOCK_USERS } from '../../../../../test/mock';
import { FilterService } from '../../../../core/services/filter.service';
import { ProposalService } from '../../../../core/services/proposal.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// This prevents the real FilterComponent from being loaded
// by overriding the component selector in the ItemListComponent template
@Component({
  selector: 'app-filter',
  template: '<div>Filter Mock</div>'
})
class MockFilterComponent {}

describe('ItemListComponent', () => {
  let component: ItemListComponent;
  let fixture: ComponentFixture<ItemListComponent>;
  let itemService: jasmine.SpyObj<ItemService>;
  let userService: jasmine.SpyObj<UserService>;
  let filterService: jasmine.SpyObj<FilterService>;
  let proposalService: jasmine.SpyObj<ProposalService>;

  beforeEach(async () => {
    // Create spy objects for services
    const itemServiceSpy = jasmine.createSpyObj('ItemService', ['getItemsByParty', 'getFilteredItems']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getCurrentUser']);
    const ownerServiceSpy = jasmine.createSpyObj('OwnerService', ['getOwnerName']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const filterServiceSpy = jasmine.createSpyObj('FilterService', ['setFilters', 'getFilters']);
    const proposalServiceSpy = jasmine.createSpyObj('ProposalService', ['getProposals']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatSortModule,
        MatButtonModule,
        MatTooltipModule,
        RouterTestingModule,
        ItemListComponent,
        MockFilterComponent
      ],
      providers: [
        { provide: ItemService, useValue: itemServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: OwnerService, useValue: ownerServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: FilterService, useValue: filterServiceSpy },
        { provide: ProposalService, useValue: proposalServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemListComponent);
    component = fixture.componentInstance;
    
    // Get the injected spy services
    itemService = TestBed.inject(ItemService) as jasmine.SpyObj<ItemService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    filterService = TestBed.inject(FilterService) as jasmine.SpyObj<FilterService>;
    proposalService = TestBed.inject(ProposalService) as jasmine.SpyObj<ProposalService>;

    // Setup spy return values
    userService.getCurrentUser.and.returnValue(of(MOCK_USERS[0]));
    itemService.getFilteredItems.and.returnValue(of([{...MOCK_ITEMS[0], hasProposals: false}]));
    proposalService.getProposals.and.returnValue(of([]));
    filterService.getFilters.and.returnValue(of({
      search: '',
      sortBy: 'name',
      sortDirection: 'asc',
      hasProposals: undefined
    }));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load items on init', () => {
    fixture.detectChanges();
    expect(component.items.length).toEqual(1);
    expect(component.items[0]).toEqual(jasmine.objectContaining({
      id: MOCK_ITEMS[0].id,
      name: MOCK_ITEMS[0].name
    }));
    
    expect(itemService.getFilteredItems).toHaveBeenCalled();
  });

  it('should handle sort changes', () => {
    fixture.detectChanges();
    
    component.onSortData({ active: 'name', direction: 'asc' });
    
    expect(filterService.setFilters).toHaveBeenCalledWith({
      sortBy: 'name',
      sortDirection: 'asc'
    });
  });
});