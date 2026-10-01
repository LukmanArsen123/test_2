import { Injectable, computed, inject, signal } from '@angular/core';

import { TicketCategory, TicketMeta, TicketPriority, TicketStatus } from './ticket.model';
import { TicketService } from './ticket.service';

@Injectable({ providedIn: 'root' })
export class TicketMetaService {
  private readonly meta = signal<TicketMeta>({ statuses: [], priorities: [], categories: [] });

  readonly statuses = computed(() => this.meta().statuses);
  readonly priorities = computed(() => this.meta().priorities);
  readonly categories = computed(() => this.meta().categories);

  constructor() {
    inject(TicketService)
      .getMeta()
      .subscribe((meta) => this.meta.set(meta));
  }

  statusLabel(status: TicketStatus): string {
    return this.statuses().find((o) => o.value === status)?.label ?? status;
  }

  priorityLabel(priority: TicketPriority): string {
    return this.priorities().find((o) => o.value === priority)?.label ?? priority;
  }

  categoryLabel(category: TicketCategory): string {
    return this.categories().find((o) => o.value === category)?.label ?? category;
  }
}
