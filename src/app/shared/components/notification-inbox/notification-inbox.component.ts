import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from 'src/app/core/services/notification.service';
import { InAppNotification, NotificationType } from 'src/app/core/models/notification.model';

@Component({
  selector: 'app-notification-inbox',
  templateUrl: './notification-inbox.component.html',
  styleUrls: ['./notification-inbox.component.scss']
})
export class NotificationInboxComponent implements OnInit, OnDestroy {
  notifications: InAppNotification[] = [];
  unreadCount = 0;
  isOpen = false;
  loading = false;
  currentPage = 0;
  totalPages = 0;
  showUnreadOnly = false;
  selectedNotification: InAppNotification | null = null;
  showModal = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    
    // Subscribe na števec neprebranih sporočil
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
    
    // Osvži števec
    this.notificationService.refreshUnreadCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications(this.currentPage, 20, this.showUnreadOnly)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.notifications = response.content.map(n => ({
            ...n,
            createdAt: new Date(n.createdAt)
          }));
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.loading = false;
        }
      });
  }

  markAsRead(notification: InAppNotification, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            notification.isRead = true;
          },
          error: (error) => {
            console.error('Error marking notification as read:', error);
          }
        });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.isRead = true);
        },
        error: (error) => {
          console.error('Error marking all as read:', error);
        }
      });
  }

  deleteNotification(notificationId: number, event: Event): void {
    event.stopPropagation();
    
    this.notificationService.deleteNotification(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
        }
      });
  }

  handleNotificationClick(notification: InAppNotification): void {
    this.markAsRead(notification);
    this.selectedNotification = notification;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedNotification = null;
  }

  navigateFromModal(): void {
    if (this.selectedNotification?.actionUrl) {
      this.router.navigate([this.selectedNotification.actionUrl]);
      this.closeModal();
      this.isOpen = false;
    }
  }

  toggleUnreadFilter(): void {
    this.showUnreadOnly = !this.showUnreadOnly;
    this.currentPage = 0;
    this.loadNotifications();
  }

  loadMore(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loading = true;
      
      this.notificationService.getNotifications(this.currentPage, 20, this.showUnreadOnly)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            const newNotifications = response.content.map(n => ({
              ...n,
              createdAt: new Date(n.createdAt)
            }));
            this.notifications = [...this.notifications, ...newNotifications];
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading more notifications:', error);
            this.loading = false;
          }
        });
    }
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}
