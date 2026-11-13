import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { NotificationsApiEndpoint } from './notifications-api-endpoint';
import { SettingsApiEndpoint } from './settings-api-endpoint';
import { Notification } from '../domain/model/notification.entity';
import { Settings } from '../domain/model/settings.entity';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';

/**
 * Infrastructure facade for the Alerting & Notifications bounded context.
 */
@Injectable({ providedIn: 'root' })
export class AlertingApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(DemoRoleSession);
  private readonly notificationsEndpoint = new NotificationsApiEndpoint(this.http);
  private readonly settingsEndpoint = new SettingsApiEndpoint();

  /**
   * Retrieves the notifications of the selected profile (all notifications when no profile is selected).
   * @returns Stream with the notification collection.
   */
  getNotifications = (): Observable<Notification[]> => {
    const profileId = this.session.profileId();
    return profileId
      ? this.notificationsEndpoint.getByRecipient(profileId)
      : this.notificationsEndpoint.getAll();
  };

  /**
   * Retrieves a single notification by ID.
   * @param id - Notification identifier.
   * @returns Stream with the notification.
   */
  getNotification = (id: number): Observable<Notification> =>
    this.notificationsEndpoint.getById(id);

  /**
   * Publishes a general notification.
   * @param notification - Notification to publish.
   * @returns Stream with the created notification.
   */
  createNotification = (notification: Notification): Observable<Notification> =>
    this.notificationsEndpoint.create(notification);

  /**
   * Marks a notification as read.
   * @param id - Notification identifier.
   * @returns Stream with the updated notification.
   */
  markNotificationAsRead = (id: number): Observable<Notification> =>
    this.notificationsEndpoint.markAsRead(id);

  /**
   * Deletes a notification by ID.
   * @param id - Notification identifier.
   * @returns Completion stream.
   */
  deleteNotification = (id: number): Observable<void> =>
    this.notificationsEndpoint.delete(id);

  /**
   * Retrieves the notification preferences kept by the user interface.
   * @returns Stream with the current settings.
   */
  getSettings = (): Observable<Settings> => this.settingsEndpoint.get();

  /**
   * Updates the notification preferences kept by the user interface.
   * @param settings - New settings.
   * @returns Stream with the stored settings.
   */
  updateSettings = (settings: Settings): Observable<Settings> => this.settingsEndpoint.update(settings);
}
