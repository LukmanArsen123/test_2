import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tickets' },
  {
    path: 'tickets',
    loadComponent: () =>
      import('./tickets/ticket-list/ticket-list.component').then((m) => m.TicketListComponent),
  },
  { path: '**', redirectTo: 'tickets' },
];
