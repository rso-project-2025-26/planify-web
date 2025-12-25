import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { OrganizationInvitation, OrganizationSummary, UserPendingJoinRequest } from '@core/models/organization.model';
import { OrganizationService } from '@core/services/organization.service';

@Component({
  selector: 'app-my-organizations',
  templateUrl: './my-organizations.component.html',
  styleUrls: ['./my-organizations.component.scss']
})
export class MyOrganizationsComponent implements OnInit, OnDestroy {
  loading = false;
  memberships: OrganizationSummary[] = [];
  invitations: OrganizationInvitation[] = [];
  pendingJoinRequests: UserPendingJoinRequest[] = [];

  joinOpen = false;
  searchQuery = '';
  orgResults: OrganizationSummary[] = [];
  searching = false;

  private searchQuery$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private orgService: OrganizationService) {}

  ngOnInit(): void {
    this.loadMemberships();
    this.loadInvitations();
    this.loadPendingJoinRequests();
    
    // Setup autocomplete search with debounce
    this.searchQuery$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => this.performSearch(query));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMemberships(): void {
    this.loading = true;
    this.orgService.getMyMemberships().subscribe({
      next: (res) => (this.memberships = res),
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  loadInvitations(): void {
    this.orgService.getMyInvitations().subscribe({
      next: (res) => (this.invitations = res),
    });
  }

  loadPendingJoinRequests(): void {
    this.orgService.getMyPendingJoinRequests().subscribe({
      next: (res) => (this.pendingJoinRequests = res),
    });
  }

  leave(orgId: string, orgName: string): void {
    if (!confirm(`Leave organization ${orgName}?`)) return;
    this.orgService.leaveOrganization(orgId).subscribe({
      next: () => {
        this.loadMemberships();
        this.loadInvitations();
        this.loadPendingJoinRequests();
      },
    });
  }

  openJoin(): void {
    this.joinOpen = true;
    this.searchQuery = '';
    this.orgResults = [];
  }

  closeJoin(): void {
    this.joinOpen = false;
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
    this.searchQuery$.next(value);
  }

  performSearch(query: string): void {
    const trimmed = query.trim();
    if (!trimmed) {
      this.orgResults = [];
      this.searching = false;
      return;
    }
    
    this.searching = true;
    this.orgService.searchOrganizations(trimmed).subscribe({
      next: (res) => {
        // Show top 5 results
        this.orgResults = res.slice(0, 5);
        this.searching = false;
      },
      error: () => {
        this.searching = false;
      }
    });
  }

  requestJoin(org: OrganizationSummary): void {
    this.orgService.requestJoin(org.id).subscribe({
      next: () => {
        alert(`Join request sent to ${org.name}`);
        this.closeJoin();
        this.loadPendingJoinRequests();
      },
    });
  }

  acceptInvitation(inv: OrganizationInvitation): void {
    this.orgService.acceptInvitation(inv.token).subscribe({
      next: () => {
        this.loadMemberships();
        this.loadInvitations();
        this.loadPendingJoinRequests();
      }
    });
  }

  declineInvitation(inv: OrganizationInvitation): void {
    this.orgService.declineInvitation(inv.token).subscribe({
      next: () => {
        this.loadMemberships();
        this.loadInvitations();
        this.loadPendingJoinRequests();
      }
    });
  }

  canRequestJoin(org: OrganizationSummary): boolean {
    const isMember = this.memberships.some(m => m.id === org.id);
    const hasInvitation = this.invitations.some(inv => inv.organization.id === org.id);
    const hasPendingRequest = this.pendingJoinRequests.some(req => req.organization.id === org.id);
    return !isMember && !hasInvitation && !hasPendingRequest;
  }

  getOrgStatus(org: OrganizationSummary): string | null {
    if (this.memberships.some(m => m.id === org.id)) {
      return 'Already a member';
    }
    if (this.invitations.some(inv => inv.organization.id === org.id)) {
      return 'Invitation pending';
    }
    if (this.pendingJoinRequests.some(req => req.organization.id === org.id)) {
      return 'Join request pending';
    }
    return null;
  }
}