export interface InAppNotification {
  id: number;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  entityType?: string;
  entityId?: number;
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  INVITATION = 'INVITATION',
  JOIN_REQUEST = 'JOIN_REQUEST',
  EVENT_UPDATE = 'EVENT_UPDATE',
  EVENT_REMINDER = 'EVENT_REMINDER'
}

export interface NotificationResponse {
  content: InAppNotification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
