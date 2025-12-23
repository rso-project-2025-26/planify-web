import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Event, EventStatus, CreateEventRequest, UpdateEventRequest } from '@core/models/event.model';
import { AuthService } from '@auth/auth.service';
import { GuestService } from './guest.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly endpoint = '/events';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private guestService: GuestService
  ) {}

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

  getMyEvents(): Observable<Event[]> {
    return this.authService.getCurrentUserId().pipe(
      switchMap(userId => {
        if (!userId) {
          return of([]);
        }

        // Get all events user is invited to (from guest service)
        return this.guestService.getAllEventsForUser(userId).pipe(
          switchMap(guestEntries => {
            // Extract event IDs from guest list entries
            const eventIds = guestEntries
              .filter(entry => entry.rsvpStatus === 'ACCEPTED' || entry.checkedIn)
              .map(entry => entry.eventId);

            if (eventIds.length === 0) {
              // User has no events, just return public events
              return this.getPublicEvents();
            }

            // Fetch all events by their IDs
            const eventRequests = eventIds.map(id => 
              this.getEventById(id).pipe(
                catchError(err => {
                  console.error(`Failed to load event ${id}:`, err);
                  return of(null);
                })
              )
            );

            return combineLatest([
              this.getPublicEvents(),
              combineLatest(eventRequests)
            ]).pipe(
              map(([publicEvents, myPrivateEvents]) => {
                // Filter out null values and duplicates
                const validPrivateEvents = myPrivateEvents.filter(e => e !== null) as Event[];
                
                // Create a map to avoid duplicates (event might be both public and user is invited)
                const eventMap = new Map<number, Event>();
                
                // Add public events first
                publicEvents.forEach(event => {
                  if (event.id) eventMap.set(event.id, event);
                });
                
                // Add private events user is invited to
                validPrivateEvents.forEach(event => {
                  if (event.id) eventMap.set(event.id, event);
                });
                
                // Return unique events, sorted by date
                return Array.from(eventMap.values())
                  .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
              })
            );
          }),
          catchError(err => {
            console.error('Failed to load my events:', err);
            // Fallback to public events only
            return this.getPublicEvents();
          })
        );
      })
    );
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