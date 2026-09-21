export type TicketStatus = 'New' | 'InProgress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketCategory = 'Hardware' | 'Software' | 'Network' | 'Access' | 'Other';

export const TICKET_STATUSES: TicketStatus[] = ['New', 'InProgress', 'Resolved', 'Closed'];
export const TICKET_PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical'];
export const TICKET_CATEGORIES: TicketCategory[] = [
  'Hardware',
  'Software',
  'Network',
  'Access',
  'Other',
];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  New: 'Новая',
  InProgress: 'В работе',
  Resolved: 'Решена',
  Closed: 'Закрыта',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  Low: 'Низкий',
  Medium: 'Средний',
  High: 'Высокий',
  Critical: 'Критичный',
};

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  Hardware: 'Оборудование',
  Software: 'ПО',
  Network: 'Сеть',
  Access: 'Доступы',
  Other: 'Другое',
};

export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  requesterEmail: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicket {
  title: string;
  description: string | null;
  requesterEmail: string;
  category: TicketCategory;
  priority: TicketPriority;
}

export interface UpdateTicket extends CreateTicket {
  status: TicketStatus;
}

export interface TicketFilters {
  search?: string;
  status?: TicketStatus | null;
  priority?: TicketPriority | null;
}
