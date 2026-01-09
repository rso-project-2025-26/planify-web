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
  id?: string;
  title: string;
  description?: string;
  eventDate: string;
  endDate?: string;
  locationId?: string;
  locationName?: string;
  organizationId: string;
  organizerId: string;
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
  locationId?: string;
  locationName?: string;
  organizationId: string;
  organizerId: string;
  maxAttendees?: number;
  eventType: EventType;
}

export interface UpdateEventRequest extends CreateEventRequest {
  status?: EventStatus;
}