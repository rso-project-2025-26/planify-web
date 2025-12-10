import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '@core/services/event.service';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss']
})
export class EventCreateComponent {
  loading = false;
  error = '';

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  onFormSubmit(eventData: any): void {
    this.loading = true;
    this.error = '';

    // Get current user ID from auth service
    this.authService.getCurrentUserId().subscribe(userId => {
      if (!userId) {
        this.error = 'You must be logged in to create an event';
        this.loading = false;
        return;
      }

      // Add organizerId to event data
      const createRequest = {
        ...eventData,
        organizerId: parseInt(userId)
      };

      // Create event
      this.eventService.createEvent(createRequest).subscribe({
        next: (event) => {
          // Navigate to the newly created event detail page
          this.router.navigate(['/events', event.id]);
        },
        error: (err) => {
          console.error('Failed to create event:', err);
          this.error = 'Failed to create event. Please try again.';
          this.loading = false;
        }
      });
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}