import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '@core/services/booking.service';
import { LocationService, LocationDto } from '@core/services/location.service';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Event } from '@core/models/event.model';
import { OrganizationSummary } from '@core/models/organization.model';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit {
  @Input() event?: Event;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() loading = false;
  @Input() organizations: OrganizationSummary[] = [];

  @Output() submitForm = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  eventForm!: FormGroup;
  minDate: string;

  availability?: boolean | null;
  checkingAvailability = false;

  constructor(private fb: FormBuilder, private bookingService: BookingService, private locationService: LocationService) {
    const today = new Date();
    this.minDate = today.toISOString().slice(0, 16);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadLocations();
  }

  initializeForm(): void {
    this.eventForm = this.fb.group({
      title: [
        this.event?.title || '', 
        [Validators.required, Validators.minLength(3), Validators.maxLength(100)]
      ],
      description: [
        this.event?.description || '', 
        [Validators.maxLength(2000)]
      ],
      eventDate: [
        this.event?.eventDate ? this.formatDateForInput(this.event.eventDate) : '',
        [Validators.required]
      ],
      endDate: [
        this.event?.endDate ? this.formatDateForInput(this.event.endDate) : ''
      ],
      locationName: [
        this.event?.locationName || '',
        [Validators.maxLength(500)]
      ],
      locationId: [
        (this as any).event?.locationId || null,
        [Validators.required]
      ],
      maxAttendees: [
        this.event?.maxAttendees || null,
        [Validators.min(1)]
      ],
      organizationId: [
        this.event?.organizationId || '',
        [Validators.required]
      ],
      eventVisibility: [
        'PRIVATE',
        [Validators.required]
      ]
    });

    this.setupLocationNameSync();

    this.eventForm.get('locationId')!.valueChanges.subscribe(locationId => {
      this.availabilityChecker();
    });
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      
      const eventData = {
        ...formValue,
        eventDate: new Date(formValue.eventDate).toISOString(),
        endDate: formValue.endDate ? new Date(formValue.endDate).toISOString() : null
      };
      
      this.submitForm.emit(eventData);
    } else {
      Object.keys(this.eventForm.controls).forEach(key => {
        this.eventForm.get(key)?.markAsTouched();
      });
    }
  }

  protected availabilityChecker(): void {
    const controls = this.eventForm.controls;
    const locationId = String(controls['locationId'].value);
    const start = new Date(controls['eventDate'].value).getTime();
    const end = new Date(controls['endDate'].value).getTime();
    if (!locationId || !start || !end || end <= start) {
      this.availability = null;
      return;
    }
    this.checkingAvailability = true;
    this.bookingService.checkAvailability(locationId, start, end).subscribe({
      next: (resp) => {
        this.availability = resp.available;
        this.checkingAvailability = false;
      },
      error: () => {
        this.availability = null;
        this.checkingAvailability = false;
      }
    });
  }

  locations: LocationDto[] = [];
  private loadLocations(): void {
    this.locationService.getLocations().subscribe({
      next: (list) => this.locations = list || [],
      error: () => this.locations = []
    });
  }

  private setupLocationNameSync(): void {
    const controls = this.eventForm.controls;
    this.eventForm.get('locationId')?.valueChanges.subscribe((id: string) => {
      const loc = this.locations.find(l => l.id === String(id));
      if (loc) {
        // Auto-fill locationName for BE convenience
        this.eventForm.get('locationName')?.setValue(`${loc.name}, ${loc.address}`);
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}