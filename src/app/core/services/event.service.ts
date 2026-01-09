import { Injectable } from '@angular/core';
import { Observable, forkJoin, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { GuestService } from './guest.service';
import { AuthService } from '../../auth/auth.service';
import { OrganizationService } from './organization.service';
import { Event, EventStatus, CreateEventRequest, UpdateEventRequest } from '@core/models/event.model';
import { GuestList, Invitation } from '@core/models/guest.model';
import { OrganizationSummary } from '@core/models/organization.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly endpoint = '/events';

  constructor(
    private apiService: ApiService,
    private guestService: GuestService,
    private authService: AuthService,
    private organizationService: OrganizationService
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
    return this.apiService.get<Event[]>(`${this.endpoint}/public`).pipe(
      map(events => events.filter(e => e.status === 'PUBLISHED'))
    );
  }

  getUpcomingEvents(): Observable<Event[]> {
    return this.apiService.get<Event[]>(`${this.endpoint}/upcoming`);
  }

  getPastEvents(): Observable<Event[]> {
    return this.apiService.get<Event[]>(`${this.endpoint}/past`);
  }

  // Events I'm invited to or events from my organizations
  getMyEvents(): Observable<Event[]> {
    return this.authService.getDatabaseUserId().pipe(
      switchMap(userId => {
        if (!userId) {
          return of([]);
        }

        return this.authService.hasAnyRole(['org_admin', 'organiser']).pipe(
          switchMap(isOrganizer => {
            return combineLatest([
              this.guestService.getMyInvitations(userId),
              isOrganizer
                ? this.organizationService.getMyAdminOrganizations()
                : of([])
            ]).pipe(
              switchMap(([invitations, myOrgs]) => {
                const invitedEventIds = invitations.map(inv => inv.eventId);
                const myOrgIds = (myOrgs || []).map(org => org.id);

                const orgEventRequests = myOrgIds.map(orgId =>
                  this.getEventsByOrganization(orgId).pipe(
                    catchError(() => of([]))
                  )
                );

                const inviteEventRequests = invitedEventIds.map(id =>
                  this.getEventById(id).pipe(
                    catchError(() => of(null))
                  )
                );

                const allRequests = [...orgEventRequests, ...inviteEventRequests];

                if (allRequests.length === 0) {
                  return of([]);
                }

                return forkJoin(allRequests).pipe(
                  map(results => {
                    const orgEvents = results
                      .slice(0, orgEventRequests.length)
                      .flat() as Event[];

                    const invitedEvents = results
                      .slice(orgEventRequests.length)
                      .filter(Boolean) as Event[];

                    const allEvents = [...invitedEvents, ...orgEvents];

                    return Array.from(
                      new Map(allEvents.map(e => [e.id, e])).values()
                    ).sort((a, b) =>
                      new Date(a.eventDate).getTime() -
                      new Date(b.eventDate).getTime()
                    );
                  })
                );
              })
            );
          })
        );
      }),
      catchError(() => of([]))
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

  // Guest List Management
  getEventGuests(eventId: string): Observable<GuestList[]> {
    return this.apiService.get<GuestList[]>(`${this.endpoint}/${eventId}/guests`);
  }

  inviteGuestToEvent(eventId: string, userId: string, organizationId: string): Observable<GuestList> {
    return this.apiService.post<GuestList>(
      `${this.endpoint}/${eventId}/guests/invite?userId=${userId}&organizationId=${organizationId}`,
      null
    );
  }

  removeGuestFromEvent(eventId: string, userId: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${eventId}/guests/${userId}`);
  }
}