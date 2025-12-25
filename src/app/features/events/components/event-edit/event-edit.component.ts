import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '@core/services/event.service';
import { OrganizationService } from '@core/services/organization.service';
import { AuthService } from '../../../../auth/auth.service';
import { Event } from '@core/models/event.model';

@Component({
  selector: 'app-event-edit',
  templateUrl: './event-edit.component.html',
  styleUrls: ['./event-edit.component.scss']
})
export class EventEditComponent implements OnInit {
  eventId!: string;
  event?: Event;
  loading = true;
  error = '';
  submitting = false;
  canEdit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private organizationService: OrganizationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    this.loadEvent();
  }

  loadEvent(): void {
    this.loading = true;
    this.error = '';

    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.checkEditPermissions();
      },
      error: (err) => {
        console.error('Failed to load event:', err);
        this.error = 'Failed to load event. Please try again.';
        this.loading = false;
      }
    });
  }

  checkEditPermissions(): void {
    this.authService.getCurrentUserId().subscribe(userId => {
      if (!userId || !this.event) {
        this.error = 'You do not have permission to edit this event.';
        this.loading = false;
        return;
      }

      // User can edit if they are the organizer
      if (this.event.organizerId === userId) {
        this.canEdit = true;
        this.loading = false;
        return;
      }

      // Or if they have ORG_ADMIN or ORGANISER role in the event's organization
      this.organizationService.getMyMemberships().subscribe({
        next: (memberships) => {
          const membership = memberships.find(m => m.id === this.event?.organizationId);
          if (membership) {
            this.authService.hasAnyRole(['ORG_ADMIN', 'ORGANISER']).subscribe(hasRole => {
              this.canEdit = hasRole;
              if (!this.canEdit) {
                this.error = 'You do not have permission to edit this event.';
              }
              this.loading = false;
            });
          } else {
            this.error = 'You do not have permission to edit this event.';
            this.loading = false;
          }
        },
        error: () => {
          this.error = 'Failed to verify permissions.';
          this.loading = false;
        }
      });
    });
  }

  onFormSubmit(eventData: any): void {
    if (!this.canEdit) {
      this.error = 'You do not have permission to edit this event.';
      return;
    }

    this.submitting = true;
    this.error = '';

    this.eventService.updateEvent(this.eventId, eventData).subscribe({
      next: (updatedEvent) => {
        this.router.navigate(['/events', updatedEvent.id]);
      },
      error: (err) => {
        console.error('Failed to update event:', err);
        this.error = 'Failed to update event. Please try again.';
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/events', this.eventId]);
  }
}