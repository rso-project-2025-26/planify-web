import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { GuestList, Invitation, RsvpStatus, InviteGuestRequest, UpdateRsvpRequest } from '@core/models/guest.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GuestService {
  private readonly endpoint = '/guests';

  constructor(private apiService: ApiService) {}

  // Guest Management
  getAllGuestsForEvent(eventId: string): Observable<GuestList[]> {
    return this.apiService.get<GuestList[]>(`${this.endpoint}/event/${eventId}`);
  }

  getMyInvitations(userId: string): Observable<Invitation[]> {
    const params = new HttpParams().set('userId', userId);
    return this.apiService.get<Invitation[]>(`${this.endpoint}/my-invitations`, params);
  }

  getMyAcceptedEvents(userId: string): Observable<Invitation[]> {
    const params = new HttpParams().set('userId', userId);
    return this.apiService.get<Invitation[]>(`${this.endpoint}/my-events`, params);
  }

  getGuestEntry(eventId: string, userId: string): Observable<GuestList> {
    return this.apiService.get<GuestList>(`${this.endpoint}/event/${eventId}/user/${userId}`);
  }

  removeGuest(eventId: string, userId: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/event/${eventId}/user/${userId}`);
  }

  // RSVP Management
  updateRsvp(eventId: string, userId: string, status: RsvpStatus): Observable<Invitation> {
    const params = new HttpParams().set('status', status);
    return this.apiService.put<Invitation>(
      `${this.endpoint}/event/${eventId}/user/${userId}/rsvp`,
      null
    );
  }

  acceptInvitation(eventId: string, userId: string): Observable<Invitation> {
    return this.apiService.put<Invitation>(
      `${this.endpoint}/my-invitations/${eventId}/accept?userId=${userId}`,
      {}
    );
  }

  declineInvitation(eventId: string, userId: string): Observable<Invitation> {
    return this.apiService.put<Invitation>(
      `${this.endpoint}/my-invitations/${eventId}/decline?userId=${userId}`,
      {}
    );
  }

  // Query Operations
  getGuestsByStatus(eventId: string, status: RsvpStatus): Observable<GuestList[]> {
    return this.apiService.get<GuestList[]>(`${this.endpoint}/event/${eventId}/status/${status}`);
  }

  // Get all invitations for an event (includes RSVP statuses)
  getEventInvitations(eventId: string): Observable<Invitation[]> {
    return this.apiService.get<Invitation[]>(`${this.endpoint}/internal/events/${eventId}/invitations`);
  }
}