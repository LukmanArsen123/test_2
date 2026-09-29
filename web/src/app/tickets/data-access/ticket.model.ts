export type TicketStatus = 'New' | 'InProgress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketCategory = 'Hardware' | 'Software' | 'Network' | 'Access' | 'Other';

export interface TicketBase {
  title: string;
  description: string | null;
  userEmail: string;
  category: TicketCategory;
  priority: TicketPriority;
}

export interface Ticket extends TicketBase {
  id: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateTicket = TicketBase;

export type UpdateTicket = TicketBase;

export interface TicketFilters {
  search?: string;
  status?: TicketStatus | null;
  priority?: TicketPriority | null;
}
