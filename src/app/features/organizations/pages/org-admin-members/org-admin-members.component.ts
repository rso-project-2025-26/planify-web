import { Component, OnInit } from '@angular/core';
import { OrganizationService } from '@core/services/organization.service';
import {
  OrgPendingInvitation, OrganizationJoinRequest, OrganizationMember, OrganizationRole, OrganizationSummary,
  UserData
} from '@core/models/organization.model';

@Component({
  selector: 'app-org-admin-members',
  templateUrl: './org-admin-members.component.html',
  styleUrls: ['./org-admin-members.component.scss']
})
export class OrgAdminMembersComponent implements OnInit {
  loading = false;
  organizations: OrganizationSummary[] = [];
  activeOrg?: OrganizationSummary;
  members: OrganizationMember[] = [];
  joinRequests: OrganizationJoinRequest[] = [];
  pendingInvitations: OrgPendingInvitation[] = [];

  joinRequestsCollapsed = false;

  inviteOpen = false;
  searchUsername = '';
  userResults: UserData[] = [];
  searching = false;

  roles: OrganizationRole[] = ['ORG_ADMIN', 'ORGANISER', 'GUEST'];

  roleSelections: Record<string, Set<OrganizationRole>> = {};
  
  recentlySaved: Set<string> = new Set();

  constructor(private orgService: OrganizationService) {}

  ngOnInit(): void {
    this.loadAdminOrgs();
  }

  loadAdminOrgs(): void {
    this.loading = true;
    this.orgService.getMyAdminOrganizations().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
        this.activeOrg = this.activeOrg || orgs[0];
        if (this.activeOrg) {
          this.loadMembers(this.activeOrg.id);
          this.loadJoinRequests(this.activeOrg.id);
          this.loadPendingInvitations(this.activeOrg.id);
        }
      },
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  loadMembers(orgId: string): void {
    this.loading = true;
    this.orgService.getMembers(orgId).subscribe({
      next: (members) => {
        this.members = members;
        this.roleSelections = {};
        members.forEach(m => {
          this.roleSelections[m.userId] = new Set<OrganizationRole>(m.roles || []);
        });
      },
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  loadJoinRequests(orgId: string): void {
    this.orgService.getPendingJoinRequests(orgId).subscribe({
      next: (reqs) => (this.joinRequests = reqs),
    });
  }

  loadPendingInvitations(orgId: string): void {
    this.orgService.getOrgPendingInvitations(orgId).subscribe({
      next: (inv) => (this.pendingInvitations = inv || []),
    });
  }

  toggleRole(member: OrganizationMember, role: OrganizationRole): void {
    const sel = this.roleSelections[member.userId] || new Set<OrganizationRole>();
    if (sel.has(role)) sel.delete(role); else sel.add(role);
    this.roleSelections[member.userId] = sel;
  }

  saveRoles(member: OrganizationMember): void {
    if (!this.activeOrg) return;
    const roles = Array.from(this.roleSelections[member.userId] || []);
    this.orgService.updateMemberRoles(this.activeOrg.id, member.userId, roles).subscribe({
      next: () => {
        member.roles = roles;
        this.recentlySaved.add(member.userId);
        setTimeout(() => this.recentlySaved.delete(member.userId), 2000);
      },
    });
  }

  remove(member: OrganizationMember): void {
    if (!this.activeOrg) return;
    if (!confirm(`Remove @${member.username} from ${this.activeOrg.name}?`)) return;
    this.orgService.removeMember(this.activeOrg.id, member.userId).subscribe({
      next: () => (this.members = this.members.filter((m) => m.userId !== member.userId)),
    });
  }

  acceptJoin(req: OrganizationJoinRequest): void {
    if (!this.activeOrg) return;
    this.orgService.acceptJoinRequest(this.activeOrg.id, req.id).subscribe({
      next: () => {
        // reload everything to reflect changes
        this.reloadAll();
      },
    });
  }

  rejectJoin(req: OrganizationJoinRequest): void {
    if (!this.activeOrg) return;
    this.orgService.rejectJoinRequest(this.activeOrg.id, req.id).subscribe({
      next: () => this.reloadAll(),
    });
  }

  openInvite(): void {
    this.inviteOpen = true;
    this.searchUsername = '';
    this.userResults = [];
  }

  closeInvite(): void {
    this.inviteOpen = false;
  }

  searchUsers(): void {
    const q = this.searchUsername.trim();
    if (!q) {
      this.userResults = [];
      return;
    }
    this.searching = true;
    this.orgService.searchUsersByUsername(q).subscribe({
      next: (res) => (this.userResults = res),
      error: () => (this.searching = false),
      complete: () => (this.searching = false),
    });
  }

  canInvite(user: UserData): boolean {
    const isMember = this.members.some(m => m.userId === user.id);
    const hasInvitation = this.pendingInvitations.some(inv => inv.userId === user.id);
    const hasPendingRequest = this.joinRequests.some(req => req.user.id === user.id);
    return !isMember && !hasInvitation && !hasPendingRequest;
  }

  getStatus(user: UserData): string | null {
    if (this.members.some(m => m.userId === user.id)) {
      return 'Already a member';
    }
    if (this.pendingInvitations.some(inv => inv.userId === user.id)) {
      return 'Invitation pending';
    }
    if (this.joinRequests.some(req => req.user.id === user.id)) {
      return 'Join request pending';
    }
    return null;
  }

  invite(username: string, userId: string): void {
    if (!this.activeOrg) return;
    this.orgService.inviteUserByUsername(this.activeOrg.id, userId).subscribe({
      next: () => {
        alert(`Invitation sent to @${username}`);
        this.closeInvite();
        this.reloadAll();
      },
    });
  }

  private reloadAll(): void {
    if (!this.activeOrg) return;
    const id = this.activeOrg.id;
    this.loadMembers(id);
    this.loadJoinRequests(id);
    this.loadPendingInvitations(id);
  }
}
