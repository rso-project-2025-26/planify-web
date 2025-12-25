import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '@core/services/event.service';
import { GuestService } from '@core/services/guest.service';
import { OrganizationService } from '@core/services/organization.service';
import { AuthService } from '../../../../auth/auth.service';
import { Event } from '@core/models/event.model';
import { GuestList, Invitation } from '@core/models/guest.model';
import { OrganizationSummary, OrganizationMember } from '@core/models/organization.model';
import { DialogService } from '@shared/services/dialog.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Location } from '@angular/common';

interface GuestWithDetails extends GuestList {
  username?: string;
  firstName?: string;
  lastName?: string;
}

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  event?: Event;
  organization?: OrganizationSummary;
  guests: GuestWithDetails[] = [];
  guestStatuses: Map<string, string> = new Map();
  organizationMembers: OrganizationMember[] = [];
  
  loading = true;
  loadingGuests = false;
  error = '';
  
  canEdit = false;
  currentUserId?: string;
  
  // Invite guest form
  showInviteForm = false;
  selectedUserId = '';
  inviting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private guestService: GuestService,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private dialogService: DialogService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id')!;
    
    // Get current user ID
    this.authService.getCurrentUserId().subscribe(userId => {
      this.currentUserId = userId || undefined;
      this.loadEventDetails(eventId);
    });
  }

  loadEventDetails(eventId: string): void {
    this.eventService.getEventById(eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.loadOrganization();
        
        // Load organization members first, then check permissions and load guests
        if (this.event?.organizationId) {
          this.organizationService.getMembers(this.event.organizationId).subscribe({
            next: (members) => {
              this.organizationMembers = members || [];
              this.checkEditPermissions();
              
              // Load guests if user can edit
              if (this.canEdit) {
                this.loadGuests(eventId);
              }
            },
            error: (err) => {
              console.error('Failed to load organization members:', err);
              this.checkEditPermissions();
            }
          });
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load event details';
        this.loading = false;
      }
    });
  }

  loadOrganization(): void {
    if (!this.event?.organizationId) return;
    
    // Get all user's memberships and find this organization
    this.organizationService.getMyMemberships().subscribe({
      next: (orgs) => {
        this.organization = orgs.find(o => o.id === this.event?.organizationId);
      },
      error: (err) => {
        console.error('Failed to load organization:', err);
      }
    });
  }

  checkEditPermissions(): void {
    if (!this.event || !this.currentUserId) {
      this.canEdit = false;
      return;
    }

    // User can edit if they are the organizer
    if (this.event.organizerId === this.currentUserId) {
      this.canEdit = true;
      return;
    }

    // Or if they have ORG_ADMIN or ORGANISER role in the event's organization
    this.organizationService.getMyMemberships().subscribe({
      next: (memberships) => {
        const membership = memberships.find(m => m.id === this.event?.organizationId);
        if (membership) {
          this.authService.hasAnyRole(['ORG_ADMIN', 'ORGANISER']).subscribe(hasRole => {
            this.canEdit = hasRole;
          });
        }
      }
    });
  }

  loadGuests(eventId: string): void {
    this.loadingGuests = true;
    
    // Load guest list from event-manager
    this.eventService.getEventGuests(eventId).subscribe({
      next: (guests) => {
        this.guests = guests || [];
        
        // Enrich guests with user details from organization members
        this.enrichGuestsWithUserDetails();
        
        // Load RSVP statuses from guest-service
        if (this.guests.length > 0) {
          this.loadGuestStatuses(eventId);
        } else {
          this.loadingGuests = false;
        }
      },
      error: (err) => {
        console.error('Failed to load guests:', err);
        this.guests = [];
        this.loadingGuests = false;
      }
    });
  }

  enrichGuestsWithUserDetails(): void {
    this.guests = this.guests.map(guest => {
      const member = this.organizationMembers.find(m => m.userId === guest.userId);
      if (member) {
        return {
          ...guest,
          username: member.username,
          firstName: member.firstName,
          lastName: member.lastName
        };
      }
      return guest;
    });
  }

  loadGuestStatuses(eventId: string): void {
    // Load RSVP statuses from guest-service
    this.guestService.getEventInvitations(eventId).subscribe({
      next: (invitations) => {
        invitations.forEach(inv => {
          this.guestStatuses.set(inv.userId, inv.rsvpStatus);
        });
        this.loadingGuests = false;
      },
      error: (err) => {
        console.error('Failed to load RSVP statuses:', err);
        this.loadingGuests = false;
      }
    });
  }

  getAvailableMembers(): OrganizationMember[] {
    const invitedUserIds = new Set(this.guests.map(g => g.userId));
    return this.organizationMembers.filter(m => !invitedUserIds.has(m.userId));
  }

  toggleInviteForm(): void {
    this.showInviteForm = !this.showInviteForm;
    this.selectedUserId = '';
  }

  inviteGuest(): void {
    if (!this.selectedUserId || !this.event?.id || !this.event?.organizationId) return;
    
    this.inviting = true;
    
    this.eventService.inviteGuestToEvent(
      this.event.id,
      this.selectedUserId,
      this.event.organizationId
    ).subscribe({
      next: (guest) => {
        this.guests.push(guest);
        this.guestStatuses.set(guest.userId, 'PENDING');
        this.enrichGuestsWithUserDetails(); // Refresh details
        this.selectedUserId = '';
        this.showInviteForm = false;
        this.inviting = false;
      },
      error: (err) => {
        console.error('Failed to invite guest:', err);
        alert('Failed to invite guest. Please try again.');
        this.inviting = false;
      }
    });
  }

  removeGuest(userId: string): void {
    if (!this.event?.id) return;
    
    const guest = this.guests.find(g => g.userId === userId);
    if (!guest) return;
    
    this.dialogService.openConfirmDialog({
      title: 'Remove Guest',
      message: 'Are you sure you want to remove this guest from the event?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      isDangerous: true
    }).then(confirmed => {
      if (confirmed) {
        this.eventService.removeGuestFromEvent(this.event!.id!, userId).subscribe({
          next: () => {
            this.guests = this.guests.filter(g => g.userId !== userId);
            this.guestStatuses.delete(userId);
          },
          error: (err) => {
            console.error('Failed to remove guest:', err);
            alert('Failed to remove guest. Please try again.');
          }
        });
      }
    });
  }

  getGuestDisplayName(guest: GuestWithDetails): string {
    if (guest.firstName && guest.lastName) {
      return `${guest.firstName} ${guest.lastName}`;
    }
    if (guest.username) {
      return `@${guest.username}`;
    }
    return `User #${guest.userId.substring(0, 8)}`;
  }

  getGuestSubtitle(guest: GuestWithDetails): string {
    if (guest.username) {
      return `@${guest.username} • ${guest.userId.substring(0, 8)}`;
    }
    return guest.userId.substring(0, 8);
  }

  getGuestStatus(userId: string): string {
    return this.guestStatuses.get(userId) || 'PENDING';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACCEPTED': return 'status-accepted';
      case 'DECLINED': return 'status-declined';
      case 'MAYBE': return 'status-maybe';
      default: return 'status-pending';
    }
  }

  editEvent(): void {
    if (this.canEdit) {
      this.router.navigate(['/events', this.event!.id, 'edit']);
    }
  }

  deleteEvent(): void {
    if (!this.canEdit) return;
    
    this.dialogService.openConfirmDialog({
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true
    }).then(confirmed => {
      if (confirmed) {
        this.eventService.deleteEvent(this.event!.id!).subscribe({
          next: () => {
            this.router.navigate(['/events/public']);
          },
          error: (err) => {
            alert('Failed to delete event');
          }
        });
      }
    });
  }

  publishEvent(): void {
    if (!this.canEdit) return;
    
    this.eventService.publishEvent(this.event!.id!).subscribe({
      next: (updated) => {
        this.event = updated;
      }
    });
  }

  cancelEvent(): void {
    if (!this.canEdit) return;
    
    this.dialogService.openConfirmDialog({
      title: 'Cancel Event',
      message: 'Are you sure you want to cancel this event? Guests will be notified.',
      confirmText: 'Cancel Event',
      cancelText: 'Keep Event',
      isDangerous: true
    }).then(confirmed => {
      if (confirmed) {
        this.eventService.cancelEvent(this.event!.id!).subscribe({
          next: (updated) => {
            this.event = updated;
          }
        });
      }
    });
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.location.back();
  }
}