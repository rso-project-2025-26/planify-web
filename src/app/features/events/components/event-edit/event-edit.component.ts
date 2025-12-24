import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '@core/services/event.service';
import { Event } from '@core/models/event.model';

@Component({
  selector: 'app-event-edit',
  templateUrl: './event-edit.component.html',
  styleUrls: ['./event-edit.component.scss']
})
export class EventEditComponent implements OnInit {
  eventId!: number;
  event?: Event;
  loading = true;
  error = '';
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.eventId = +this.route.snapshot.paramMap.get('id')!;
    this.loadEvent();
  }

  loadEvent(): void {
    this.loading = true;
    this.error = '';

    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load event:', err);
        this.error = 'Failed to load event. Please try again.';
        this.loading = false;
      }
    });
  }

  onFormSubmit(eventData: any): void {
    this.submitting = true;
    this.error = '';

    this.eventService.updateEvent(this.eventId, eventData).subscribe({
      next: (updatedEvent) => {
        // Navigate to the updated event detail page
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