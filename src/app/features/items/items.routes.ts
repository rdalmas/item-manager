import { Routes } from '@angular/router';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/item-list/item-list.component')
          .then(m => m.ItemListComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/item-detail/item-detail.component')
          .then(m => m.ItemDetailComponent)
      }
    ]
  }
] as Routes;