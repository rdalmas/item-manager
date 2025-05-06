import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/items', 
    pathMatch: 'full' 
  },
  {
    path: 'items',
    loadChildren: () => import('./features/items/items.routes')
      .then(m => m.default)
  },
  {
    path: 'proposals',
    loadChildren: () => import('./features/proposals/proposals.routes')
      .then(m => m.default)
  },
  { 
    path: '**', 
    redirectTo: '/items' 
  }
];