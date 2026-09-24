import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tickets' },
  { path: 'tickets', loadChildren: () => import('./tickets/tickets.module').then((m) => m.TicketsModule) },
  { path: '**', redirectTo: 'tickets' },
];
