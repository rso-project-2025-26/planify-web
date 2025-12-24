import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  constructor(private fb: FormBuilder) {
    const today = new Date();
    this.minDate = today.toISOString().slice(0, 16);
  }

  ngOnInit(): void {
    this.initializeForm();
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