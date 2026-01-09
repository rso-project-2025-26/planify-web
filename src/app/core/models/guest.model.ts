export enum RsvpStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  MAYBE = 'MAYBE'
}

export interface GuestList {
  id?: string;
  eventId: string;
  userId: string;
  organizationId: string;
  invitedAt?: string;
}

export interface Invitation {
  id?: string;
  eventId: string;
  userId: string;
  organizationId: string;
  rsvpStatus: RsvpStatus;
  respondedAt?: string;
  invitationReceivedAt?: string;
}

export interface InviteGuestRequest {
  eventId: string;
  userId: string;
  organizationId: string;
}

export interface UpdateRsvpRequest {
  status: RsvpStatus;
}