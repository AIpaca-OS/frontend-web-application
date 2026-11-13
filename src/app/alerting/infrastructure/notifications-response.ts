import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Resource returned by the Notifications endpoints (NotificationResponse in Swagger).
 */
export interface NotificationResource extends BaseResource {
  id: number;
  category: 'GENERAL' | 'STUDENT_JOURNEY';
  type: 'WARNING' | 'SUCCESS' | 'IMPORTANT' | 'INFO';
  priority: 'CRITICAL' | 'REGULAR';
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
  read: boolean;
  routeId: number | null;
  tripId: number | null;
  studentId: number | null;
  recipientProfileId: number | null;
  journeyEvent: string | null;
}

/**
 * Body accepted by POST /notifications (CreateNotificationRequest in Swagger).
 */
export interface CreateNotificationResource {
  type: NotificationResource['type'];
  priority: NotificationResource['priority'];
  title: string;
  message: string;
  routeId: number | null;
  studentId: number | null;
  recipientProfileId: number | null;
}

/**
 * Response envelope for notification collection queries.
 */
export interface NotificationsResponse extends BaseResponse {
  notifications: NotificationResource[];
}
