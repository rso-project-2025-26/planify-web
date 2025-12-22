import { Injectable } from '@angular/core';
import { AuthService } from '@auth/auth.service';
import { NotificationService } from './notification.service';
import { InAppNotification } from '../models/notification.model';
import { environment } from '@environments/environment';
import { combineLatest } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebSocketNotificationService {
  private socket: WebSocket | null = null;
  private reconnectInterval = 5000; // 5 seconds
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;
  private userId: string | null = null;
  private shouldReconnect = true;

  constructor(
      private authService: AuthService,
      private notificationService: NotificationService
  ) {}

  connect(): void {
    // Preverimo ali so obvestila preko webSocket-a omogočena
    if (!environment. enableWebSocketNotifications) {
      console.info('[WebSocket] Real-time notifications are disabled.  Set enableWebSocketNotifications=true in environment to enable.');
      return;
    }

    this.authService.isAuthenticated$. subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.shouldReconnect = true;
        this.initializeWebSocket();
      } else {
        this.shouldReconnect = false;
        this.disconnect();
      }
    });
  }

  private initializeWebSocket(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return; // Že povezan
    }

    combineLatest([
      this.authService['oidc'].getAccessToken(),
      this.authService.getCurrentUserId()
    ]).pipe(
        filter(([token, userId]) => !!token && !!userId),
        take(1)
    ).subscribe(
        ([token, userId]) => {
          this.userId = userId as string;
          this.connectWithCredentials(token as string, userId as string);
        },
        (error: any) => {
          console.error('[WebSocket] Error getting credentials:', error);
        }
    );
  }

  private connectWithCredentials(token: string, userId: string): void {
    // Zgradi WebSocket URL z tokenom in userId-jem kot query parametri
    const wsUrl = `${environment.notificationWebSocketUrl}?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`;

    console.log('[WebSocket] Connecting to:', environment.notificationWebSocketUrl);

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const notification: InAppNotification = JSON.parse(event.data);
          console. log('[WebSocket] Received notification:', notification);

          this.notificationService.addNotification(notification);
          this.showBrowserNotification(notification);
        } catch (error) {
          console.error('[WebSocket] Error parsing notification:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('[WebSocket] Connection error:', error);
      };

      this.socket.onclose = (event) => {
        console.log('[WebSocket] Disconnected.  Code:', event.code, 'Reason:', event.reason);
        if (this.shouldReconnect) {
          this.attemptReconnect();
        }
      };
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
    }
  }

  private attemptReconnect(): void {
    if (! this.shouldReconnect) {
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WebSocket] Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectInterval / 1000}s... `);

      setTimeout(() => {
        this.initializeWebSocket();
      }, this.reconnectInterval);
    } else {
      console.warn('[WebSocket] Max reconnection attempts reached.  Real-time notifications disabled.');
      console.info('[WebSocket] To enable real-time notifications, ensure the notification service is running and accessible.');
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
  }

  sendMessage(message: any): void {
    if (this.socket && this.socket. readyState === WebSocket. OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message. Connection is not open.');
    }
  }

  private showBrowserNotification(notification:  InAppNotification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icons/notification-icon.png',
        badge: '/assets/icons/badge-icon. png',
        tag: notification.id?. toString() || 'notification'
      });

      setTimeout(() => browserNotification.close(), 5000);

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };
    }
  }

  requestNotificationPermission(): Promise<NotificationPermission> {
    if (! ('Notification' in window)) {
      console.warn('[WebSocket] This browser does not support desktop notifications');
      return Promise.resolve('denied');
    }

    if (Notification.permission === 'granted') {
      return Promise.resolve('granted');
    }

    if (Notification.permission !== 'denied') {
      return Notification.requestPermission().then(permission => {
        console.log('[WebSocket] Notification permission:', permission);
        return permission;
      });
    }

    return Promise.resolve(Notification.permission);
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}