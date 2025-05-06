import { Routes } from '@angular/router';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/proposal-list/proposal-list.component')
          .then(m => m.ProposalListComponent)
      },
      {
        path: 'item/:itemId',
        loadComponent: () => import('./components/proposal-history/proposal-history.component')
          .then(m => m.ProposalHistoryComponent)
      }
    ]
  }
] as Routes;