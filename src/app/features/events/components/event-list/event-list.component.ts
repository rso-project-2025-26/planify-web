import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../core/services/event.service';
import { GuestService } from '../../../../core/services/guest.service';
import { Event, EventStatus, EventType } from '../../../../core/models/event.model';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
  eventType: 'public' | 'my-events' = 'public';

  events: Event[] = [];
  filteredEvents: Event[] = [];
  loading = false;
  error = '';
  isOrganizer = false;
  
  // Filters
  searchTerm = '';
  selectedLocation = '';
  selectedDateRange: 'all' | 'today' | 'thisWeek' | 'thisMonth' = 'all';
  selectedEventType: 'any' | 'public' | 'private' = 'any';
  selectedStatus: 'all' | 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' = 'all';
  
  // For dropdowns
  uniqueLocations: string[] = [];
  
  // Invitations dropdown
  showInvitationsDropdown = false;
  pendingInvitationsCount = 0;
  
  constructor(
    private eventService: EventService,
    private guestService: GuestService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Read route data to determine which type of events to load
    this.route.data.subscribe(data => {
      this.eventType = data['eventType'] || 'public';

      this.authService.hasAnyRole(['org_admin', 'organiser']).subscribe(hasRole => {
        this.isOrganizer = hasRole;
      });

      this.loadEvents();
      
      // Load pending invitations count for "My Events" tab
      if (this.eventType === 'my-events') {
        this.loadPendingInvitationsCount();
      }
    });
  }

  /**
   * Load events based on the event type (public or my-events)
   */
  loadEvents(): void {
    this.loading = true;
    this.error = '';
    
    const request$ = this.eventType === 'my-events' 
      ? this.eventService.getMyEvents()
      : this.eventService.getPublicEvents();
    
    request$.subscribe({
      next: (events) => {
        this.events = events || [];
        this.filteredEvents = events || [];
        this.extractUniqueLocations();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.error = 'Failed to load events. Please try again later.';
        this.events = [];
        this.filteredEvents = [];
        this.loading = false;
      }
    });
  }

  /**
   * Extract unique locations for filter dropdown
   */
  extractUniqueLocations(): void {
    if (!this.events || this.events.length === 0) {
      this.uniqueLocations = [];
      return;
    }
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

      const matchesStatus = 
        this.selectedStatus === 'all' ||
        event.status === this.selectedStatus; 
      
      return matchesSearch && matchesLocation && matchesDateRange && matchesEventType && matchesStatus;
    });
  }

  areFiltersActive(): boolean {
    return (
      this.searchTerm.trim() !== '' ||
      this.selectedLocation !== '' ||
      this.selectedDateRange !== 'all' ||
      this.selectedEventType !== 'any' ||
      this.selectedStatus !== 'all'
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
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  /**
   * View event details
   */
  viewEvent(eventId: string): void {
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
        this.authService.login();
        return;
      }
      
      // For now, navigate to event detail
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
    this.authService.login();
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

  /**
   * Get page title based on event type
   */
  getPageTitle(): string {
    return this.eventType === 'my-events' ? 'My Events' : 'Public Events';
  }

  /**
   * Get page subtitle based on event type
   */
  getPageSubtitle(): string {
    return this.eventType === 'my-events' 
      ? 'Events you are attending or invited to'
      : 'Explore and participate in upcoming activities';
  }

  /**
   * Load pending invitations count
   */
  loadPendingInvitationsCount(): void {
    this.authService.getDatabaseUserId().subscribe(userId => {
      if (!userId) return;

      this.guestService.getMyInvitations(userId).subscribe({
        next: (invitations) => {
          this.pendingInvitationsCount = invitations.filter(inv => inv.rsvpStatus === 'PENDING').length;
        },
        error: (err) => {
          console.error('Failed to load pending invitations count:', err);
        }
      });
    });
  }

  /**
   * Toggle invitations dropdown
   */
  toggleInvitationsDropdown(): void {
    this.showInvitationsDropdown = !this.showInvitationsDropdown;
  }

  /**
   * Close invitations dropdown
   */
  closeInvitationsDropdown(): void {
    this.showInvitationsDropdown = false;
    // Reload count after closing (in case user accepted/declined)
    this.loadPendingInvitationsCount();
  }
}