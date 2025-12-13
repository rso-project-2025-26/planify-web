import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  JoinOrganizationRequest,
  OrganizationMember,
  OrganizationRole,
  OrganizationSummary,
  OrganizationJoinRequest,
  OrganizationInvitation,
  OrgPendingInvitation,
  UserPendingJoinRequest, UserData,
} from '@core/models/organization.model';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly baseOrgs = '/api/organizations';
  private readonly baseUsers = '/api/users';
  private readonly baseInvitations = '/api/invitations';

  constructor(private http: HttpClient) {}

  getMyMemberships(): Observable<OrganizationSummary[]> {
    return this.http.get<OrganizationSummary[]>(`${this.baseUsers}/me/orgs`);
  }

  leaveOrganization(organizationId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseOrgs}/me/memberships/${organizationId}`);
  }

  searchOrganizations(query: string): Observable<OrganizationSummary[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<OrganizationSummary[]>(`${this.baseOrgs}/search`, { params });
  }

  requestJoin(organizationId: string): Observable<void> {
    const body: JoinOrganizationRequest = { organizationId };
    return this.http.post<void>(`${this.baseUsers}/${organizationId}/join-request`, body);
  }

  getMyPendingJoinRequests(): Observable<UserPendingJoinRequest[]> {
    return this.http.get<UserPendingJoinRequest[]>(`${this.baseUsers}/me/join-requests`);
  }

  getMyAdminOrganizations(): Observable<OrganizationSummary[]> {
    return this.http.get<OrganizationSummary[]>(`${this.baseOrgs}/admin/org`);
  }

  getMembers(organizationId: string): Observable<OrganizationMember[]> {
    return this.http.get<OrganizationMember[]>(`${this.baseOrgs}/${organizationId}/members`);
  }

  updateMemberRoles(
    organizationId: string,
    userId: string,
    roles: OrganizationRole[]
  ): Observable<void> {
    let params = new HttpParams();
    roles.forEach(r => params = params.append('newRoles', r));
    return this.http.put<void>(`${this.baseOrgs}/${organizationId}/members/${userId}/role`, {}, { params });
  }

  removeMember(organizationId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseOrgs}/${organizationId}/members/${userId}`);
  }

  getPendingJoinRequests(organizationId: string): Observable<OrganizationJoinRequest[]> {
    return this.http.get<OrganizationJoinRequest[]>(`${this.baseOrgs}/${organizationId}/join-requests`);
  }

  acceptJoinRequest(organizationId: string, requestId: string): Observable<void> {
    return this.http.post<void>(`${this.baseOrgs}/${organizationId}/join-request/${requestId}/approve`, {});
  }

  rejectJoinRequest(organizationId: string, requestId: string): Observable<void> {
    return this.http.post<void>(`${this.baseOrgs}/${organizationId}/join-request/${requestId}/reject`, {});
  }

  getMyInvitations(): Observable<OrganizationInvitation[]> {
    return this.http.get<OrganizationInvitation[]>(`${this.baseInvitations}/currentUser`);
  }

  acceptInvitation(invitationToken: string): Observable<void> {
    return this.http.post<void>(`${this.baseInvitations}/${invitationToken}/accept`, {});
  }

  declineInvitation(invitationId: string): Observable<void> {
    return this.http.post<void>(`${this.baseInvitations}/${invitationId}/decline`, {});
  }

  searchUsersByUsername(username: string): Observable<UserData[]> {
    const params = new HttpParams().set('username', username);
    return this.http.get<UserData[]>(`${this.baseUsers}/search`, { params });
  }

  inviteUserByUsername(organizationId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${this.baseOrgs}/${organizationId}/invite`, {}, { params: new HttpParams().set('userId', userId) });
  }

  getOrgPendingInvitations(organizationId: string): Observable<OrgPendingInvitation[]> {
    return this.http.get<any[]>(`${this.baseInvitations}/${organizationId}/pending`).pipe(
      // map to simplified structure used in UI
      // eslint-disable-next-line rxjs/no-ignored-observable
      (source => new Observable<OrgPendingInvitation[]>(subscriber => {
        const sub = source.subscribe({
          next: (arr) => {
            const mapped = (arr || []).map((it: any) => ({
              id: it.id,
              userId: it.user?.id,
              username: it.user?.username,
              createdAt: it.createdAt,
            } as OrgPendingInvitation));
            subscriber.next(mapped);
          },
          error: (e) => subscriber.error(e),
          complete: () => subscriber.complete(),
        });
        return () => sub.unsubscribe();
      }))
    );
  }
}
