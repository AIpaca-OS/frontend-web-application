import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Notification } from '../domain/model/notification.entity';
import { NotificationResource, NotificationsResponse } from './notifications-response';
import { NotificationAssembler } from './notifications-assembler';
import { environment } from '../../../environments/environment';

/**
 * Endpoint client for the Notifications resource.
 *
 * @remarks
 * Supported operations (Swagger): GET /notifications?recipientProfileId|studentId, GET /notifications/{id},
 * POST /notifications, PATCH /notifications/{id}/read and DELETE /notifications/{id}.
 * There is no PUT, so the generic update is not exposed by the facade.
 */
export class NotificationsApiEndpoint extends BaseApiEndpoint<Notification, NotificationResource, NotificationsResponse, NotificationAssembler> {
  /**
   * Creates an instance of NotificationsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderNotificationsEndpointPath}`, new NotificationAssembler());
  }

  /**
   * Fetches the notifications addressed to a profile.
   * @param recipientProfileId - Tutor or driver profile identifier.
   * @returns Stream with the mapped notifications.
   */
  getByRecipient(recipientProfileId: number): Observable<Notification[]> {
    return this.http.get<NotificationResource[]>(this.endpointUrl, { params: { recipientProfileId } }).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to fetch notifications by recipient'))
    );
  }

  /**
   * Publishes a general notification.
   * @param entity - Notification to publish.
   * @returns Stream with the created notification.
   */
  override create(entity: Notification): Observable<Notification> {
    return this.http.post<NotificationResource>(this.endpointUrl, this.assembler.toCreateResourceFromEntity(entity)).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create notification'))
    );
  }

  /**
   * Marks a notification as read.
   * @param id - Notification identifier.
   * @returns Stream with the updated notification.
   */
  markAsRead(id: number): Observable<Notification> {
    return this.http.patch<NotificationResource>(`${this.endpointUrl}/${id}/read`, {}).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to mark notification as read'))
    );
  }
}
