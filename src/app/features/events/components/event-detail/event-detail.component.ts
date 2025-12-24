import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '@core/services/event.service';
import { GuestService } from '@core/services/guest.service';
import { OrganizationService } from '@core/services/organization.service';
import { AuthService } from '../../../../auth/auth.service';
import { Event } from '@core/models/event.model';
import { GuestList } from '@core/models/guest.model';
import { OrganizationSummary } from '@core/models/organization.model';
import { DialogService } from '@shared/services/dialog.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  event?: Event;
  organization?: OrganizationSummary;
  guests: GuestList[] = [];
  loading = true;
  error = '';
  
  canEdit = false;
  currentUserId?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private guestService: GuestService,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private dialogService: DialogService
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
        this.checkEditPermissions();
        
        // TODO: Load guests when guest list management is implemented
        // if (this.canEdit) {
        //   this.loadGuests(eventId);
        // }
        
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
          // Check if user has admin privileges
          // This assumes membership has roles property - adjust based on your model
          this.authService.hasAnyRole(['ORG_ADMIN', 'ORGANISER']).subscribe(hasRole => {
            this.canEdit = hasRole;
          });
        }
      }
    });
  }

  // TODO: Implement guest list loading
  // loadGuests(eventId: number): void {
  //   this.guestService.getAllGuestsForEvent(eventId).subscribe({
  //     next: (guests) => {
  //       this.guests = guests;
  //     },
  //     error: (err) => {
  //       console.error('Failed to load guests:', err);
  //     }
  //   });
  // }

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

  formatDate(dateString: string): string {
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
    this.router.navigate(['/events/public']);
  }
}