import { Injectable, inject, signal } from '@angular/core';
import { Observable, Subscription, finalize } from 'rxjs';

import { SaveTicket, Ticket, TicketFilters, TicketStatus } from './ticket.model';
import { TicketService } from './ticket.service';

@Injectable({ providedIn: 'root' })
export class TicketStore {
  private readonly api = inject(TicketService);
  private loadSubscription?: Subscription;

  readonly tickets = signal<Ticket[]>([]);
  readonly loading = signal(false);

  load(filters: TicketFilters): void {
    this.loadSubscription?.unsubscribe();
    this.loading.set(true);

    this.loadSubscription = this.api
      .getAll(filters)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((result) => this.tickets.set(result));
  }

  create(dto: SaveTicket): Observable<Ticket> {
    return this.api.create(dto);
  }

  update(id: string, dto: SaveTicket): Observable<Ticket> {
    return this.api.update(id, dto);
  }

  changeStatus(id: string, status: TicketStatus): Observable<Ticket> {
    return this.api.changeStatus(id, status);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id);
  }
}
