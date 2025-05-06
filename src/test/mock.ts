import { Item } from '../app/core/models/item.interface';
import { User } from '../app/core/models/user.interface';

export const MOCK_ITEMS: Item[] = [{
  id: 1,
  name: 'Test Item',
  description: 'Test Description',
  ownerIds: [1, 2],
  totalCost: 1000
}];

export const MOCK_USERS: User[] = [{
  id: 1,
  name: 'Test User',
  email: 'testuser@example.com',
  partyId: 1
}, { id: 2, name: 'User 2', partyId: 2, email: 'testuser2@example.com' }];