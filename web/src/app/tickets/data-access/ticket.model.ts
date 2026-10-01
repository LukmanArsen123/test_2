export type TicketStatus = 'New' | 'InProgress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketCategory = 'Hardware' | 'Software' | 'Network' | 'Access' | 'Other';

export interface SaveTicket {
  title: string;
  description: string | null;
  userEmail: string;
  category: TicketCategory;
  priority: TicketPriority;
}

export interface Ticket extends SaveTicket {
  id: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TicketFilters {
  search?: string;
  status?: TicketStatus | null;
  priority?: TicketPriority | null;
}

export interface TicketOption<T extends string> {
  value: T;
  label: string;
}

export interface TicketMeta {
  statuses: TicketOption<TicketStatus>[];
  priorities: TicketOption<TicketPriority>[];
  categories: TicketOption<TicketCategory>[];
}
