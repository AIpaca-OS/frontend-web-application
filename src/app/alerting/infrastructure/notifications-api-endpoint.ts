import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Notification } from '../domain/model/notification.entity';
import { NotificationResource, NotificationsResponse } from './notifications-response';
import { NotificationAssembler } from './notifications-assembler';
import { environment } from '../../../environments/environment';

export class NotificationsApiEndpoint extends BaseApiEndpoint<
  Notification, NotificationResource, NotificationsResponse, NotificationAssembler
> {
  // The generic Notifications controller is intentionally available in demo mode only.
  private readonly demoBackend = environment.routePlanningApiMode === 'backend';

  constructor(http: HttpClient) {
    super(http,
      (environment.routePlanningApiMode === 'backend' ? environment.routePlanningApiBaseUrl : environment.platformProviderApiBaseUrl)
        + environment.platformProviderNotificationsEndpointPath,
      new NotificationAssembler());
  }

  override create(entity: Notification): Observable<Notification> {
    if (!this.demoBackend) return super.create(entity);
    return this.http.post<NotificationResource>(this.endpointUrl, {
      type: entity.type,
      priority: entity.priority,
      title: entity.title,
      message: entity.message,
    }).pipe(map(resource => this.assembler.toEntityFromResource(resource)));
  }

  override update(entity: Notification, id: number): Observable<Notification> {
    if (!this.demoBackend) return super.update(entity, id);
    return this.http.patch<NotificationResource>(
      this.endpointUrl + '/' + id + '/read', {},
    ).pipe(map(resource => this.assembler.toEntityFromResource(resource)));
  }
}
