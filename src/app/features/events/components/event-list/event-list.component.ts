import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../../../core/services/event.service';
import { Event, EventStatus, EventType } from '../../../../core/models/event.model';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
  @Input() eventType: 'public' | 'my-events' | 'all' = 'public';
  @Input() organizerId?: number;

  events: Event[] = [];
  filteredEvents: Event[] = [];
  loading = false;
  error = '';
  
  // Filters
  searchTerm = '';
  selectedLocation = '';
  selectedDateRange: 'all' | 'today' | 'thisWeek' | 'thisMonth' = 'all';
  selectedEventType: 'any' | 'public' | 'private' = 'any';
  
  // For dropdowns
  uniqueLocations: string[] = [];
  
  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  /**
   * Load public events from API
   */
  loadEvents(): void {
    this.loading = true;
    this.error = '';
    let request$;
    
    switch(this.eventType) {
      case 'public':
        request$ = this.eventService.getPublicEvents();
        break;
      case 'my-events':
        request$ = this.eventService.getEventsByOrganizer(this.organizerId!);
        break;
      case 'all':
        request$ = this.eventService.getAllEvents();
        break;
      default:
        request$ = this.eventService.getPublicEvents();
    }
    
    request$.subscribe({
      next: (events) => {
        this.events = events;
        this.filteredEvents = events;
        this.extractUniqueLocations();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.error = 'Failed to load events. Please try again later.';
        this.loading = false;
      }
    });
  }

  /**
   * Extract unique locations for filter dropdown
   */
  extractUniqueLocations(): void {
    const locations = this.events
      .map(e => e.locationName)
      .filter((loc): loc is string => !!loc);
    this.uniqueLocations = [...new Set(locations)];
  }

  /**
   * Apply all filters
   */
  applyFilters(): void {
    this.filteredEvents = this.events.filter(event => {
      // Search filter
      const matchesSearch = !this.searchTerm || 
        event.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Location filter
      const matchesLocation = !this.selectedLocation || 
        event.locationName === this.selectedLocation;
      
      // Date range filter
      const matchesDateRange = this.matchesDateRange(event);

      // Event type filter
      const matchesEventType =
        this.selectedEventType === 'any' ||
        (this.selectedEventType === 'public' && event.eventType === "PUBLIC") ||
        (this.selectedEventType === 'private' && event.eventType === "PRIVATE");
      
      return matchesSearch && matchesLocation && matchesDateRange && matchesEventType;
    });
  }

  areFiltersActive(): boolean {
    return (
      this.searchTerm.trim() !== '' ||
      this.selectedLocation !== '' ||
      this.selectedDateRange !== 'all' ||
      this.selectedEventType !== 'any'
    );
  }

  /**
   * Check if event matches selected date range
   */
  matchesDateRange(event: Event): boolean {
    if (this.selectedDateRange === 'all') return true;
    
    const eventDate = new Date(event.eventDate);
    const now = new Date();
    
    switch (this.selectedDateRange) {
      case 'today':
        return this.isSameDay(eventDate, now);
      case 'thisWeek':
        return this.isThisWeek(eventDate, now);
      case 'thisMonth':
        return this.isThisMonth(eventDate, now);
      default:
        return true;
    }
  }

  /**
   * Check if two dates are the same day
   */
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Check if date is in the same week
   */
  isThisWeek(date: Date, now: Date): boolean {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return date >= startOfWeek && date <= endOfWeek;
  }

  /**
   * Check if date is in the same month
   */
  isThisMonth(date: Date, now: Date): boolean {
    return date.getFullYear() === now.getFullYear() &&
           date.getMonth() === now.getMonth();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedLocation = '';
    this.selectedDateRange = 'all';
    this.selectedEventType = 'any';
    this.applyFilters();
  }

  /**
   * View event details
   */
  viewEvent(eventId: number): void {
    this.router.navigate(['/events', eventId]);
  }

  /**
   * RSVP to event (requires login)
   */
  rsvpToEvent(event: Event): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) {
        // Show message and redirect to login
        alert('Please sign in to RSVP to this event');
        this.router.navigate(['/auth/login']);
        return;
      }
      
      // For now
      this.viewEvent(event.id!);
    });
  }

  /**
   * Navigate to registration
   */
  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Navigate to login
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format short date
   */
  formatShortDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
      day: 'numeric'
    });
  }

  /**
   * Format time
   */
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Check if event is within 24 hours
   */
  isSoon(event: Event): boolean {
    const eventDate = new Date(event.eventDate);
    const now = new Date();
    const hoursDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 0 && hoursDiff <= 24;
  }

  /**
   * Check if event is full
   */
  isEventFull(event: Event): boolean {
    return event.maxAttendees !== null && 
           event.maxAttendees !== undefined &&
           event.currentAttendees >= event.maxAttendees;
  }
}
