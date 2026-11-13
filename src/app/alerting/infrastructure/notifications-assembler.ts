import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Notification } from '../domain/model/notification.entity';
import { CreateNotificationResource, NotificationResource, NotificationsResponse } from './notifications-response';

/**
 * Maps notification entities to and from API resources.
 *
 * @remarks
 * The backend uses upper-case enum values; the domain keeps the lower-case values used by the views.
 */
export class NotificationAssembler implements BaseAssembler<Notification, NotificationResource, NotificationsResponse> {
  /**
   * Converts a NotificationsResponse to an array of Notification entities.
   * @param response - The API response containing notifications.
   * @returns An array of Notification entities.
   */
  toEntitiesFromResponse = (response: NotificationsResponse): Notification[] =>
    response.notifications.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a NotificationResource to a Notification entity.
   * @param resource - The resource to convert.
   * @returns The converted Notification entity.
   */
  toEntityFromResource = (resource: NotificationResource): Notification =>
    new Notification({
      id: resource.id,
      type: (resource.type ?? 'INFO').toLowerCase(),
      priority: (resource.priority ?? 'REGULAR').toLowerCase(),
      title: resource.title,
      message: resource.message,
      createdAt: resource.createdAt,
      readAt: resource.readAt ?? '',
      read: resource.read,
      routeId: resource.routeId ?? 0,
      studentId: resource.studentId,
      journeyEvent: resource.journeyEvent,
    });

  /**
   * Converts a Notification entity to a NotificationResource.
   * @param entity - The entity to convert.
   * @returns The converted NotificationResource.
   */
  toResourceFromEntity = (entity: Notification): NotificationResource => ({
    id: entity.id,
    category: entity.journeyEvent ? 'STUDENT_JOURNEY' : 'GENERAL',
    type: entity.type.toUpperCase() as NotificationResource['type'],
    priority: entity.priority.toUpperCase() === 'CRITICAL' ? 'CRITICAL' : 'REGULAR',
    title: entity.title,
    message: entity.message,
    createdAt: entity.createdAt,
    readAt: entity.readAt || null,
    read: entity.read,
    routeId: entity.routeId || null,
    tripId: null,
    studentId: entity.studentId,
    recipientProfileId: null,
    journeyEvent: entity.journeyEvent,
  });

  /**
   * Converts a Notification entity to the body accepted by POST /notifications.
   * @param entity - The entity to publish.
   * @returns The CreateNotificationResource request body.
   */
  toCreateResourceFromEntity = (entity: Notification): CreateNotificationResource => {
    const resource = this.toResourceFromEntity(entity);
    return {
      type: resource.type,
      priority: resource.priority,
      title: resource.title,
      message: resource.message,
      routeId: resource.routeId,
      studentId: resource.studentId,
      recipientProfileId: resource.recipientProfileId,
    };
  };
}
