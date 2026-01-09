import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface LocationDto {
  id: string;
  name: string;
  address: string;
  capacity: number;
  pricePerHourCents: number;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private baseUrl = '/api/locations';

  constructor(private http: HttpClient) {}

  getLocations(): Observable<LocationDto[]> {
    return this.http.get<LocationDto[]>(`${this.baseUrl}`);
  }

  getLocation(id: number): Observable<LocationDto> {
    return this.http.get<LocationDto>(`${this.baseUrl}/${id}`);
  }
}
