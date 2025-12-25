import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GuestService } from '@core/services/guest.service';
import { EventService } from '@core/services/event.service';
import { OrganizationService } from '@core/services/organization.service';
import { AuthService } from '../../../../auth/auth.service';
import { Invitation, RsvpStatus } from '@core/models/guest.model';
import { Event as EventModel } from '@core/models/event.model';
import { OrganizationSummary } from '@core/models/organization.model';

interface InvitationWithDetails extends Invitation {
  event?: EventModel;
  organizationName?: string;
}

@Component({
  selector: 'app-invitations-dropdown',
  templateUrl: './invitations-dropdown.component.html',
  styleUrls: ['./invitations-dropdown.component.scss']
})
export class InvitationsDropdownComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  invitations: InvitationWithDetails[] = [];
  pendingInvitations: InvitationWithDetails[] = [];
  loading = true;
  currentUserId?: string;
  organizationsMap: Map<string, OrganizationSummary> = new Map();

  constructor(
    private guestService: GuestService,
    private eventService: EventService,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.authService.getDatabaseUserId().subscribe((userId: string | null) => {
      
      if (!userId) {
        this.loading = false;
        return;
      }

      this.currentUserId = userId;
      
      // Load organizations first
      this.organizationService.getMyMemberships().subscribe({
        next: (orgs) => {
          orgs.forEach(org => this.organizationsMap.set(org.id, org));
          this.loadInvitationsData(userId);
        },
        error: () => {
          // Continue without organizations
          this.loadInvitationsData(userId);
        }
      });
    });
  }

  loadInvitationsData(userId: string): void {    
    this.guestService.getMyInvitations(userId).subscribe({
      next: (invitations) => {
        this.invitations = invitations || [];
        
        // Filter pending invitations
        const pending = this.invitations.filter(inv => inv.rsvpStatus === 'PENDING');
        
        // Fetch event details for each invitation
        if (pending.length > 0) {
          this.loadEventDetails(pending);
        } else {
          this.pendingInvitations = [];
          this.loading = false;
        }
      },
      error: (err) => {
        this.invitations = [];
        this.pendingInvitations = [];
        this.loading = false;
      }
    });
  }

  loadEventDetails(invitations: InvitationWithDetails[]): void {
    const requests = invitations.map(invitation => {
      return this.eventService.getEventById(invitation.eventId).pipe(
        map(event => ({
          ...invitation,
          event: event,
          organizationName: this.organizationsMap.get(invitation.organizationId)?.name || 'Organization'
        })),
        catchError(err => {
          return of({
            ...invitation,
            event: undefined,
            organizationName: this.organizationsMap.get(invitation.organizationId)?.name || 'Organization'
          });
        })
      );
    });

    forkJoin(requests).subscribe({
      next: (invitationsWithDetails) => {
        this.pendingInvitations = invitationsWithDetails;
        this.loading = false;
      },
      error: (err) => {
        this.pendingInvitations = invitations; // Show without details
        this.loading = false;
      }
    });
  }

  acceptInvitation(invitation: InvitationWithDetails, event: MouseEvent): void {
    event.stopPropagation();
    
    if (!this.currentUserId) return;

    this.guestService.acceptInvitation(invitation.eventId, this.currentUserId).subscribe({
      next: (updated) => {
        invitation.rsvpStatus = RsvpStatus.ACCEPTED;
        invitation.respondedAt = updated.respondedAt;
        this.pendingInvitations = this.pendingInvitations.filter(inv => inv.eventId !== invitation.eventId);
      },
      error: (err) => {
        console.error('Failed to accept invitation:', err);
        alert('Failed to accept invitation. Please try again.');
      }
    });
  }

  declineInvitation(invitation: InvitationWithDetails, event: MouseEvent): void {
    event.stopPropagation();
    
    if (!this.currentUserId) return;

    this.guestService.declineInvitation(invitation.eventId, this.currentUserId).subscribe({
      next: (updated) => {
        invitation.rsvpStatus = RsvpStatus.DECLINED;
        invitation.respondedAt = updated.respondedAt;
        this.pendingInvitations = this.pendingInvitations.filter(inv => inv.eventId !== invitation.eventId);
      },
      error: (err) => {
        console.error('Failed to decline invitation:', err);
        alert('Failed to decline invitation. Please try again.');
      }
    });
  }

  viewEvent(invitation: InvitationWithDetails): void {
    this.close.emit();
    this.router.navigate(['/events', invitation.eventId]);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onClose(): void {
    this.close.emit();
  }
}