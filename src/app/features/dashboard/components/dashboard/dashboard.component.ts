import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '@core/services/event.service';
import { Event, EventStatus } from '@core/models/event.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  upcomingEvents: Event[] = [];
  recentEvents: Event[] = [];
  loading = true;
  error: string | null = null;

  // Statistics
  totalEvents = 0;
  publishedEvents = 0;
  draftEvents = 0;
  completedEvents = 0;

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Load upcoming events
    this.eventService.getUpcomingEvents().subscribe({
      next: (events) => {
        this.upcomingEvents = events.slice(0, 5); // Get first 5
      },
      error: (err) => {
        console.error('Error loading upcoming events:', err);
      }
    });

    // Load all events for statistics
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.totalEvents = events.length;
        this.publishedEvents = events.filter(e => e.status === EventStatus.PUBLISHED).length;
        this.draftEvents = events.filter(e => e.status === EventStatus.DRAFT).length;
        this.completedEvents = events.filter(e => e.status === EventStatus.COMPLETED).length;
        
        // Get recent events (last 5)
        this.recentEvents = events
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
          .slice(0, 5);
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
        console.error('Error loading events:', err);
      }
    });
  }

  viewEvent(eventId: string): void {
    this.router.navigate(['/events', eventId]);
  }

  goToEvents(): void {
    this.router.navigate(['/events']);
  }

  createEvent(): void {
    this.router.navigate(['/events/create']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getTimeUntil(dateString: string): string {
    const now = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`;
    return `In ${Math.floor(diffDays / 30)} months`;
  }
}