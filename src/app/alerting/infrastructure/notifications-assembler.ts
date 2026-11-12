import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Notification } from '../domain/model/notification.entity';
import { NotificationResource, NotificationsResponse } from './notifications-response';

export class NotificationAssembler implements BaseAssembler<
  Notification,
  NotificationResource,
  NotificationsResponse
> {
  toEntitiesFromResponse(response: NotificationsResponse): Notification[] {
    return response.notifications.map((notification) => this.toEntityFromResource(notification));
  }

  toEntityFromResource(resource: NotificationResource): Notification {
    return new Notification({
      id: resource.id,
      type: resource.type,
      priority: resource.priority,
      title: resource.title,
      message: resource.message,
      createdAt: resource.createdAt,
      readAt: resource.readAt,
      read: resource.read,
      routeId: resource.routeId,
      studentId: resource.studentId,
    });
  }

  toResourceFromEntity(entity: Notification): NotificationResource {
    return {
      id: entity.id,
      type: entity.type,
      priority: entity.priority,
      title: entity.title,
      message: entity.message,
      createdAt: entity.createdAt,
      readAt: entity.readAt,
      read: entity.read,
      routeId: entity.routeId,
      studentId: entity.studentId,
    };
  }
}
