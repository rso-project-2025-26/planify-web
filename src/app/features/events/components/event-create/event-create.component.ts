import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { EventService } from '@core/services/event.service';
import { AuthService } from '../../../../auth/auth.service';
import { OrganizationService } from '@core/services/organization.service';
import { OrganizationSummary } from '@core/models/organization.model';
import { EventType } from '@core/models/event.model';

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss']
})
export class EventCreateComponent implements OnInit {
  loading = false;
  error = '';
  organizations: OrganizationSummary[] = [];
  loadingOrgs = true;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private organizationService: OrganizationService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.loadingOrgs = true;
    this.organizationService.getMyAdminOrganizations().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
        this.loadingOrgs = false;
        
        if (orgs.length === 0) {
          this.error = 'You must be an organiser or admin of an organization to create events.';
        }
      },
      error: (err) => {
        console.error('Failed to load organizations:', err);
        this.error = 'Failed to load your organizations. Please try again.';
        this.loadingOrgs = false;
      }
    });
  }

  onFormSubmit(eventData: any): void {
    this.loading = true;
    this.error = '';

    // Get current user ID from auth service
    this.authService.getCurrentUserId().pipe(
      switchMap(userId => {
        if (!userId) {
          throw new Error('You must be logged in to create an event');
        }

        // Determine backend eventType based on visibility
        const visibility = eventData.eventVisibility;
        const backendEventType = visibility === 'PUBLIC' ? EventType.PUBLIC : EventType.PRIVATE;

        // Create event request
        const createRequest = {
          title: eventData.title,
          description: eventData.description,
          eventDate: eventData.eventDate,
          endDate: eventData.endDate,
          locationId: eventData.locationId,
          locationName: eventData.locationName,
          maxAttendees: eventData.maxAttendees,
          organizationId: eventData.organizationId,
          eventType: backendEventType,
          organizerId: userId
        };

        return this.eventService.createEvent(createRequest).pipe(
          switchMap(createdEvent => {
            // Ensure event has an id
            if (!createdEvent.id) {
              throw new Error('Created event missing ID');
            }

            // If PUBLIC_WITHIN_ORG, auto-invite all org members
            if (visibility === 'PUBLIC_WITHIN_ORG') {
              return this.eventService.publishEvent(createdEvent.id).pipe(
                switchMap(publishedEvent => 
                  this.organizationService.getMembers(eventData.organizationId).pipe(
                    switchMap(members => {
                      const membersToInvite = members.filter(member =>
                        member.userId !== userId &&
                        !member.roles.includes('ORGANISER') &&
                        !member.roles.includes('ORG_ADMIN')
                      );

                      const inviteRequests = membersToInvite.map(member =>
                        this.eventService.inviteGuestToEvent(
                          publishedEvent.id!,
                          member.userId,
                          eventData.organizationId
                        ).pipe(
                          catchError(err => {
                            console.error(`Failed to invite user ${member.userId}:`, err);
                            return of(null);
                          })
                        )
                      );

                      if (inviteRequests.length > 0) {
                        return forkJoin(inviteRequests).pipe(
                          switchMap(() => of(publishedEvent))
                        );
                      }

                      return of(publishedEvent);
                    }),
                    catchError(err => {
                      console.error('Failed to load org members for auto-invite:', err);
                      return of(publishedEvent);
                    })
                  )
                )
              );
            }

            return of(createdEvent);
          })
        );
      })
    ).subscribe({
      next: (event) => {
        // Navigate to the event detail page
        this.router.navigate(['/events', event.id]);
      },
      error: (err) => {
        console.error('Failed to create event:', err);
        this.error = err.message || 'Failed to create event. Please try again.';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/events/public']);
  }
}