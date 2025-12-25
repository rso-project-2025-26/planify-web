import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { GuestService } from '@core/services/guest.service';
import { AuthService } from '../../../../auth/auth.service';
import { Invitation, RsvpStatus } from '@core/models/guest.model';

@Component({
  selector: 'app-invitations-dropdown',
  templateUrl: './invitations-dropdown.component.html',
  styleUrls: ['./invitations-dropdown.component.scss']
})
export class InvitationsDropdownComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  invitations: Invitation[] = [];
  pendingInvitations: Invitation[] = [];
  loading = true;
  currentUserId?: string;

  constructor(
    private guestService: GuestService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.authService.getCurrentUserId().subscribe((userId: string | null) => {
      if (!userId) {
        this.loading = false;
        return;
      }

      this.currentUserId = userId;
      
      this.guestService.getMyInvitations(userId).subscribe({
        next: (invitations) => {
          this.invitations = invitations || [];
          
          // Show only pending invitations in dropdown
          this.pendingInvitations = this.invitations.filter(inv => inv.rsvpStatus === 'PENDING');
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load invitations:', err);
          this.invitations = [];
          this.pendingInvitations = [];
          this.loading = false;
        }
      });
    });
  }

  acceptInvitation(invitation: Invitation, event: Event): void {
    event.stopPropagation();
    
    if (!this.currentUserId) return;

    this.guestService.acceptInvitation(invitation.eventId, this.currentUserId).subscribe({
      next: (updated) => {
        // Update local state
        invitation.rsvpStatus = RsvpStatus.ACCEPTED;
        invitation.respondedAt = updated.respondedAt;
        // Remove from pending list
        this.pendingInvitations = this.pendingInvitations.filter(inv => inv.eventId !== invitation.eventId);
      },
      error: (err) => {
        console.error('Failed to accept invitation:', err);
        alert('Failed to accept invitation. Please try again.');
      }
    });
  }

  declineInvitation(invitation: Invitation, event: Event): void {
    event.stopPropagation();
    
    if (!this.currentUserId) return;

    this.guestService.declineInvitation(invitation.eventId, this.currentUserId).subscribe({
      next: (updated) => {
        // Update local state
        invitation.rsvpStatus = RsvpStatus.DECLINED;
        invitation.respondedAt = updated.respondedAt;
        // Remove from pending list
        this.pendingInvitations = this.pendingInvitations.filter(inv => inv.eventId !== invitation.eventId);
      },
      error: (err) => {
        console.error('Failed to decline invitation:', err);
        alert('Failed to decline invitation. Please try again.');
      }
    });
  }

  viewEvent(invitation: Invitation): void {
    this.close.emit();
    this.router.navigate(['/events', invitation.eventId]);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onClose(): void {
    this.close.emit();
  }
}