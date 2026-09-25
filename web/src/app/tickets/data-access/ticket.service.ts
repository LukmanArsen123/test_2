import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CreateTicket, Ticket, TicketFilters, TicketStatus, UpdateTicket } from './ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tickets`;

  getAll(filters: TicketFilters = {}): Observable<Ticket[]> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.priority) params = params.set('priority', filters.priority);
    return this.http.get<Ticket[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateTicket): Observable<Ticket> {
    return this.http.post<Ticket>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateTicket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.baseUrl}/${id}`, dto);
  }

  changeStatus(id: string, status: TicketStatus): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${id}/status`, { status });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
