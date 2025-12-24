import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '@core/services/event.service';
import { GuestService } from '@core/services/guest.service';
import { AuthService } from '../../../../auth/auth.service';
import { Event } from '@core/models/event.model';
import { GuestList } from '@core/models/guest.model';
import { DialogService } from '@shared/services/dialog.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  event?: Event;
  guests: GuestList[] = [];
  loading = true;
  error = '';
  
  isOrganizer = false;
  currentUserId?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private guestService: GuestService,
    private authService: AuthService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    const eventId = +this.route.snapshot.paramMap.get('id')!;
    
    // Get current user ID
    this.authService.getCurrentUserId().subscribe(userId => {
      this.currentUserId = userId || undefined;
      this.loadEventDetails(eventId);
    });
  }

  loadEventDetails(eventId: number): void {
    this.eventService.getEventById(eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.checkIfOrganizer();
        
        // Load guests if organizer
        if (this.isOrganizer) {
          this.loadGuests(eventId);
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load event details';
        this.loading = false;
      }
    });
  }

  loadGuests(eventId: number): void {
    this.guestService.getAllGuestsForEvent(eventId).subscribe({
      next: (guests) => {
        this.guests = guests;
      },
      error: (err) => {
        console.error('Failed to load guests:', err);
      }
    });
  }

  checkIfOrganizer(): void {
    if (this.event && this.currentUserId) {
      this.isOrganizer = this.event.organizerId === this.currentUserId;
    }
  }

  // Not yet implemented
  editEvent(): void {
    this.router.navigate(['/events', this.event!.id, 'edit']);
  }

  deleteEvent(): void {
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
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            alert('Failed to delete event');
          }
        });
      }
    });
  }

  publishEvent(): void {
    this.eventService.publishEvent(this.event!.id!).subscribe({
      next: (updated) => {
        this.event = updated;
      }
    });
  }

  cancelEvent(): void {
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
    this.router.navigate(['/events']);
  }
}