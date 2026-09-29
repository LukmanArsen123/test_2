import { Injectable } from '@angular/core';

import { TicketCategory, TicketPriority, TicketStatus } from './ticket.model';

const STATUS_LABELS: Record<TicketStatus, string> = {
  New: 'Новая',
  InProgress: 'В работе',
  Resolved: 'Решена',
  Closed: 'Закрыта',
};

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  Low: 'Низкий',
  Medium: 'Средний',
  High: 'Высокий',
  Critical: 'Критичный',
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  Hardware: 'Оборудование',
  Software: 'ПО',
  Network: 'Сеть',
  Access: 'Доступы',
  Other: 'Другое',
};

// Дублирует Domain/TicketStatusRules.cs на бэкенде — только для UX, источник истины — сервер.
const STATUS_TRANSITIONS: Record<TicketStatus, readonly TicketStatus[]> = {
  New: ['InProgress', 'Closed'],
  InProgress: ['Resolved', 'Closed', 'New'],
  Resolved: ['Closed', 'InProgress'],
  Closed: ['InProgress'],
};

/** Единственное место на фронте со справочниками статусов, приоритетов и категорий заявок. */
@Injectable({ providedIn: 'root' })
export class TicketMetaService {
  readonly statuses = Object.keys(STATUS_LABELS) as readonly TicketStatus[];
  readonly priorities = Object.keys(PRIORITY_LABELS) as readonly TicketPriority[];
  readonly categories = Object.keys(CATEGORY_LABELS) as readonly TicketCategory[];

  statusLabel(status: TicketStatus): string {
    return STATUS_LABELS[status];
  }

  priorityLabel(priority: TicketPriority): string {
    return PRIORITY_LABELS[priority];
  }

  categoryLabel(category: TicketCategory): string {
    return CATEGORY_LABELS[category];
  }

  nextStatuses(status: TicketStatus): readonly TicketStatus[] {
    return STATUS_TRANSITIONS[status];
  }
}
