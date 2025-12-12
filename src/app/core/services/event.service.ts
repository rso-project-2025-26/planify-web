import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Event, EventStatus, CreateEventRequest, UpdateEventRequest } from '@core/models/event.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly endpoint = '/events';

  constructor(private apiService: ApiService) {}

  // CRUD Operations
  getAllEvents(): Observable<Event[]> {
    return this.apiService.get<Event[]>(this.endpoint);
  }

  getEventById(id: number): Observable<Event> {
    return this.apiService.get<Event>(`${this.endpoint}/${id}`);
  }

  createEvent(event: CreateEventRequest): Observable<Event> {
    return this.apiService.post<Event>(this.endpoint, event);
  }

  updateEvent(id: number, event: UpdateEventRequest): Observable<Event> {
    return this.apiService.put<Event>(`${this.endpoint}/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  // Query Operations
  getEventsByOrganization(organizationId: string): Observable<Event[]> {
    return this.apiService.get<Event[]>(`${this.endpoint}/organization/${organizationId}`);
  }

  getEventsByStatus(status: EventStatus): Observable<Event[]> {
    return this.apiService.get<Event[]>(`${this.endpoint}/status/${status}`);
  }

  getPublicEvents(): Observable<Event[]> {
    return this.apiService.get<Event[]>(`${this.endpoint}/public`);
  }

  getUpcomingEvents(): Observable<Event[]> {
    return this.apiService.get<Event[]>(`${this.endpoint}/upcoming`);
  }

  getPastEvents(): Observable<Event[]> {
    return this.apiService.get<Event[]>(`${this.endpoint}/past`);
  }

  // Status Management
  publishEvent(id: number): Observable<Event> {
    return this.apiService.put<Event>(`${this.endpoint}/${id}/publish`, {});
  }

  cancelEvent(id: number): Observable<Event> {
    return this.apiService.put<Event>(`${this.endpoint}/${id}/cancel`, {});
  }

  completeEvent(id: number): Observable<Event> {
    return this.apiService.put<Event>(`${this.endpoint}/${id}/complete`, {});
  }
}
