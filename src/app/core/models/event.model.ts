export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum EventType {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC'
}

export interface Event {
  id?: number;
  title: string;
  description?: string;
  eventDate: string;
  endDate?: string;
  locationId?: number;
  locationName?: string;
  organizerId: number;
  maxAttendees?: number;
  currentAttendees: number;
  eventType: EventType;
  status: EventStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  eventDate: string;
  endDate?: string;
  locationId?: number;
  locationName?: string;
  organizerId: number;
  maxAttendees?: number;
  eventType: EventType;
}

export interface UpdateEventRequest extends CreateEventRequest {
  status?: EventStatus;
}
