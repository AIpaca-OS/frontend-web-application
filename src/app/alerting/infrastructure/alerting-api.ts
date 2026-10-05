import { BaseApi } from '../../shared/infrastructure/base-api';
import { NotificationsApiEndpoint } from './notifications-api-endpoint';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../domain/model/notification.entity';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AlertingApi extends BaseApi {
  private readonly notificationsEndpoint: NotificationsApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.notificationsEndpoint = new NotificationsApiEndpoint(http);
  }

  getNotifications(): Observable<Notification[]> {
    return this.notificationsEndpoint.getAll();
  }

  getNotification(id: number): Observable<Notification> {
    return this.notificationsEndpoint.getById(id);
  }

  createNotification(notification: Notification): Observable<Notification> {
    return this.notificationsEndpoint.create(notification);
  }

  updateNotification(notification: Notification): Observable<Notification> {
    return this.notificationsEndpoint.update(notification, notification.id);
  }

  deleteNotification(id: number): Observable<void> {
    return this.notificationsEndpoint.delete(id);
  }
}
