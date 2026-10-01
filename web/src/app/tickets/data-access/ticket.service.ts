import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SaveTicket, Ticket, TicketFilters, TicketMeta, TicketStatus } from './ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tickets`;
  private readonly metaUrl = `${environment.apiUrl}/ticket-meta`;

  getAll(filters: TicketFilters = {}): Observable<Ticket[]> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.priority) params = params.set('priority', filters.priority);
    return this.http.get<Ticket[]>(this.baseUrl, { params });
  }

  getMeta(): Observable<TicketMeta> {
    return this.http.get<TicketMeta>(this.metaUrl);
  }

  getById(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
  }

  create(dto: SaveTicket): Observable<Ticket> {
    return this.http.post<Ticket>(this.baseUrl, dto);
  }

  update(id: string, dto: SaveTicket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.baseUrl}/${id}`, dto);
  }

  changeStatus(id: string, status: TicketStatus): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${id}/status`, { status });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
