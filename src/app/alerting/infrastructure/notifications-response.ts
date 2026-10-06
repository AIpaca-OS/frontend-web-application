import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface NotificationResource extends BaseResource {
  id: number;
  type: string;
  priority: string;
  title: string;
  message: string;
  createdAt: string;
  readAt: string;
  read: boolean;
  routeId: number;
  studentId: number | null;
}

export interface NotificationsResponse extends BaseResponse {

  notifications: NotificationResource[];

}
