import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { GuestList, RsvpStatus, GuestRole, InviteGuestRequest, UpdateRsvpRequest } from '@core/models/guest.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GuestService {
  private readonly endpoint = '/guests';

  constructor(private apiService: ApiService) {}

  // Guest Management
  getAllGuestsForEvent(eventId: number): Observable<GuestList[]> {
    return this.apiService.get<GuestList[]>(`${this.endpoint}/event/${eventId}`);
  }

  getAllEventsForUser(userId: string): Observable<GuestList[]> {
    return this.apiService.get<GuestList[]>(`${this.endpoint}/user/${userId}`);
  }

  getGuestEntry(eventId: number, userId: string): Observable<GuestList> {
    return this.apiService.get<GuestList>(`${this.endpoint}/event/${eventId}/user/${userId}`);
  }

  inviteGuest(request: InviteGuestRequest): Observable<GuestList> {
    const params = new HttpParams()
      .set('eventId', request.eventId.toString())
      .set('userId', request.userId)
      .set('role', request.role || GuestRole.ATTENDEE)
      .set('notes', request.notes || '');
    
    return this.apiService.post<GuestList>(`${this.endpoint}/invite`, null);
  }

  removeGuest(eventId: number, userId: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/event/${eventId}/user/${userId}`);
  }

  // RSVP Management
  updateRsvp(eventId: number, userId: string, status: RsvpStatus): Observable<GuestList> {
    const params = new HttpParams().set('status', status);
    return this.apiService.put<GuestList>(
      `${this.endpoint}/event/${eventId}/user/${userId}/rsvp`,
      null
    );
  }

  acceptInvitation(eventId: number, userId: string): Observable<GuestList> {
    return this.apiService.put<GuestList>(
      `${this.endpoint}/event/${eventId}/user/${userId}/accept`,
      {}
    );
  }

  declineInvitation(eventId: number, userId: string): Observable<GuestList> {
    return this.apiService.put<GuestList>(
      `${this.endpoint}/event/${eventId}/user/${userId}/decline`,
      {}
    );
  }

  // Check-in Management
  checkInGuest(eventId: number, userId: string): Observable<GuestList> {
    return this.apiService.put<GuestList>(
      `${this.endpoint}/event/${eventId}/user/${userId}/check-in`,
      {}
    );
  }

  getCheckedInGuests(eventId: number): Observable<GuestList[]> {
    return this.apiService.get<GuestList[]>(`${this.endpoint}/event/${eventId}/checked-in`);
  }

  countCheckedInGuests(eventId: number): Observable<number> {
    return this.apiService.get<number>(`${this.endpoint}/event/${eventId}/checked-in/count`);
  }

  // Query Operations
  getGuestsByStatus(eventId: number, status: RsvpStatus): Observable<GuestList[]> {
    return this.apiService.get<GuestList[]>(`${this.endpoint}/event/${eventId}/status/${status}`);
  }

  getGuestsByRole(eventId: number, role: GuestRole): Observable<GuestList[]> {
    return this.apiService.get<GuestList[]>(`${this.endpoint}/event/${eventId}/role/${role}`);
  }
}
