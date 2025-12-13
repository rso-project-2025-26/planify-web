export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
}

export type OrganizationRole = 'ORG_ADMIN' | 'ORGANISER' | 'GUEST';

export interface OrganizationMember {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  roles: OrganizationRole[];
}

export interface JoinOrganizationRequest {
  organizationId: string;
}

export interface OrganizationJoinRequest {
  id: string;
  organizationId: string;
  username: string;
  user: {id: string, username: string};
  createdAt: string;
}

export interface OrganizationInvitation {
  id: string;
  token: string;
  organization: OrganizationSummary;
  createdAt: string;
  invitedBy?: { id: string; username: string };
}

export interface OrgPendingInvitation {
  id: string;
  userId: string;
  username: string;
  createdAt?: string;
}

export interface UserPendingJoinRequest {
  id: string;
  organization: OrganizationSummary;
  createdAt: string;
}

export interface UserData {
  id: string;
  email: string;
  username: string;
}
