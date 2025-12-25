import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface CheckAvailabilityResponseDto {
  available: boolean;
  conflictingBookingIds: number[];
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = environment.bookingServiceUrl; // 'api/booking' via proxy to booking-service (8086)

  constructor(private http: HttpClient) {}

  checkAvailability(locationId: string, startEpochMillis: number, endEpochMillis: number): Observable<CheckAvailabilityResponseDto> {
    const url = `${this.baseUrl}/${locationId}/availability`;
    const params = { start: startEpochMillis, end: endEpochMillis } as any;
    return this.http.get<CheckAvailabilityResponseDto>(url, { params });
  }
}
