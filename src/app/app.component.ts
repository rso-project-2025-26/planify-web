import {Component, OnDestroy, OnInit} from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { WebSocketNotificationService } from '@core/services/websocket-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Planify';
  
  constructor(
    private oidc: OidcSecurityService,
    private webSocketService: WebSocketNotificationService
  ) {}

  ngOnInit(): void {
    // Initialize WebSocket connection for real-time notifications
    this.webSocketService.connect();
  }

  ngOnDestroy() {
    // Disconnect when app is destroyed
    this.webSocketService.disconnect();
  }
}
