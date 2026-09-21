import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { CreateTicket, Ticket, TicketFilters, UpdateTicket } from '../models/ticket.model';

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

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

export function extractErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Нет связи с сервером. Проверьте, что API запущен.';
    }
    const body = err.error;
    if (body?.errors && typeof body.errors === 'object') {
      const messages = Object.values(body.errors as Record<string, string[]>).flat();
      if (messages.length) return messages.join('\n');
    }
    if (body?.detail) return body.detail;
    if (body?.title) return body.title;
    return `Ошибка ${err.status}`;
  }
  return 'Неизвестная ошибка';
}
