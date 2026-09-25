import { Injectable, inject, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { CreateTicket, Ticket, TicketFilters, TicketStatus, UpdateTicket } from './ticket.model';
import { TicketService } from './ticket.service';

@Injectable({ providedIn: 'root' })
export class TicketStore {
  private readonly api = inject(TicketService);
  private loadSubscription?: Subscription;

  readonly tickets = signal<Ticket[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  load(filters: TicketFilters): void {
    this.loadSubscription?.unsubscribe();
    this.loading.set(true);
    this.error.set(null);

    this.loadSubscription = this.api.getAll(filters).subscribe({
      next: (result) => {
        this.tickets.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Не удалось загрузить заявки. Проверьте, что API запущен.');
        this.loading.set(false);
      },
    });
  }

  create(dto: CreateTicket): Observable<Ticket> {
    return this.api.create(dto);
  }

  update(id: string, dto: UpdateTicket): Observable<Ticket> {
    return this.api.update(id, dto);
  }

  changeStatus(id: string, status: TicketStatus): Observable<Ticket> {
    return this.api.changeStatus(id, status);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id);
  }
}
