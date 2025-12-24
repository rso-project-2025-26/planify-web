import { Injectable } from '@angular/core';
import { Observable, forkJoin, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { GuestService } from './guest.service';
import { AuthService } from '../../auth/auth.service';
import { Event, EventStatus, CreateEventRequest, UpdateEventRequest } from '@core/models/event.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly endpoint = '/events';

  constructor(
    private apiService: ApiService,
    private guestService: GuestService,
    private authService: AuthService
  ) {}

  // CRUD Operations
  getAllEvents(): Observable<Event[]> {
    return this.apiService.get<Event[]>(this.endpoint);
  }

  getEventById(id: string): Observable<Event> {
    return this.apiService.get<Event>(`${this.endpoint}/${id}`);
  }

  createEvent(event: CreateEventRequest): Observable<Event> {
    return this.apiService.post<Event>(this.endpoint, event);
  }

  updateEvent(id: string, event: UpdateEventRequest): Observable<Event> {
    return this.apiService.put<Event>(`${this.endpoint}/${id}`, event);
  }

  deleteEvent(id: string): Observable<void> {
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

  // Get My Events (Public + Invited/Accepted)
  getMyEvents(): Observable<Event[]> {
    return this.authService.getCurrentUserId().pipe(
      switchMap(userId => {
        if (!userId) {
          return this.getPublicEvents();
        }
        
        return combineLatest([
          this.getPublicEvents(),
          this.guestService.getMyAcceptedEvents(userId)
        ]).pipe(
          switchMap(([publicEvents, invitations]) => {
            // Get event IDs from invitations
            const invitedEventIds = invitations.map(inv => inv.eventId);
            
            // Fetch full event details for invited events
            if (invitedEventIds.length === 0) {
              return of(publicEvents);
            }
            
            const eventRequests = invitedEventIds.map(id => 
              this.getEventById(id).pipe(
                catchError(err => {
                  console.error(`Failed to fetch event ${id}:`, err);
                  return of(null);
                })
              )
            );
            
            return forkJoin(eventRequests).pipe(
              map(invitedEvents => {
                const validEvents = invitedEvents.filter(e => e !== null) as Event[];
                // Combine and remove duplicates
                const allEvents = [...publicEvents, ...validEvents];
                const uniqueEvents = Array.from(
                  new Map(allEvents.map(e => [e.id, e])).values()
                );
                // Sort by date
                return uniqueEvents.sort((a, b) => 
                  new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
                );
              })
            );
          })
        );
      }),
      catchError(err => {
        console.error('Failed to load my events:', err);
        return this.getPublicEvents();
      })
    );
  }

  // Status Management
  publishEvent(id: string): Observable<Event> {
    return this.apiService.put<Event>(`${this.endpoint}/${id}/publish`, {});
  }

  cancelEvent(id: string): Observable<Event> {
    return this.apiService.put<Event>(`${this.endpoint}/${id}/cancel`, {});
  }

  completeEvent(id: string): Observable<Event> {
    return this.apiService.put<Event>(`${this.endpoint}/${id}/complete`, {});
  }
}