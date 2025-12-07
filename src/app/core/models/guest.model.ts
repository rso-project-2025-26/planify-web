export enum RsvpStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  MAYBE = 'MAYBE'
}

export enum GuestRole {
  ATTENDEE = 'ATTENDEE',
  SPEAKER = 'SPEAKER',
  VIP = 'VIP',
  STAFF = 'STAFF'
}

export interface GuestList {
  id?: number;
  eventId: number;
  userId: number;
  rsvpStatus: RsvpStatus;
  role: GuestRole;
  invitedAt?: string;
  respondedAt?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  notes?: string;
}

export interface InviteGuestRequest {
  eventId: number;
  userId: number;
  role?: GuestRole;
  notes?: string;
}

export interface UpdateRsvpRequest {
  status: RsvpStatus;
}
