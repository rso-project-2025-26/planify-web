import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {BehaviorSubject, Observable, tap, throwError} from 'rxjs';
import { environment } from '../../../environments/environment';
import { InAppNotification, NotificationResponse } from '../models/notification.model';
import {AuthService} from "@auth/auth.service";
import {switchMap, take} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.eventManagerServiceUrl}/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadUnreadCount();
  }

  getNotifications(page: number = 0, size: number = 20, unreadOnly: boolean = false): Observable<NotificationResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (unreadOnly) {
      params = params.set('unreadOnly', 'true');
    }

    // const userId = this.authService.getCurrentUserId();
    // this.http.get<NotificationResponse>(`${this.apiUrl}/user/${userId}`, { params });

    return this.authService.getCurrentUserId().pipe(
        take(1),
        switchMap(userId => userId
            ? this.http.get<NotificationResponse>(`${this.apiUrl}/user/${userId}`, { params })
            : throwError(() => new Error('Not authenticated'))
        )
    );
  }

  getUnreadCount(): Observable<number> {
    return this.authService.getCurrentUserId().pipe(
        take(1),
        switchMap(userId => userId
            ? this.http.get<number>(`${this.apiUrl}/user/${userId}/unread/count`)
            : throwError(() => new Error('Not authenticated'))
        ),
        tap(count => this.unreadCountSubject.next(count))
    );
  }

  private loadUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(() => {
        const current = this.unreadCountSubject.value;
        this.unreadCountSubject.next(Math.max(0, current - 1));
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.authService.getCurrentUserId().pipe(
        take(1),
        switchMap(userId => userId
            ? this.http.put<void>(`${this.apiUrl}/user/${userId}/read-all`, {})
            : throwError(() => new Error('Not authenticated'))
        ),
        tap(() => this.unreadCountSubject.next(0))
    );
  }

  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`);
  }

  refreshUnreadCount(): void {
    this.loadUnreadCount();
  }

  addNotification(notification: InAppNotification): void {
    if (!notification.isRead) {
      const current = this.unreadCountSubject.value;
      this.unreadCountSubject.next(current + 1);
    }
  }
}
