import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/ticket-list/ticket-list.component').then((m) => m.TicketListComponent),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TicketsModule {}
