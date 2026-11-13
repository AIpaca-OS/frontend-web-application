import { computed, DestroyRef, inject, Injectable, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { AlertingApi } from '../infrastructure/alerting-api';
import { Notification } from '../domain/model/notification.entity';
import { Settings } from '../domain/model/settings.entity';
import { toErrorMessageKey } from '../../shared/infrastructure/api-error';

/**
 * Holds Alerting & Notifications application state and coordinates notification operations.
 *
 * @remarks
 * `error` and `settingsError` contain i18n keys that the views render with TranslatePipe.
 */
@Injectable({
  providedIn: 'root',
})
export class AlertingStore {
  private readonly alertingApi = inject(AlertingApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly notificationsSignal = signal<Notification[]>([]);

  /**
   * Readonly signal for the list of notifications of the selected profile.
   */
  readonly notifications = this.notificationsSignal.asReadonly();

  private readonly settingsSignal = signal<Settings | null>(null);

  /**
   * Readonly signal for the notification preferences.
   */
  readonly settings = this.settingsSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);

  /**
   * Readonly signal indicating if data is loading.
   */
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);

  /**
   * Readonly signal for the current error (i18n key).
   */
  readonly error = this.errorSignal.asReadonly();

  private readonly settingsErrorSignal = signal<string | null>(null);

  /**
   * Readonly signal for the current settings error (i18n key).
   */
  readonly settingsError = this.settingsErrorSignal.asReadonly();

  /**
   * Computed signal for the count of notifications.
   */
  readonly notificationsCount = computed(() => this.notifications().length);

  /**
   * Computed signal for the count of unread notifications.
   */
  readonly unreadCount = computed(() => this.notifications().filter(notification => !notification.read).length);

  /**
   * Creates an instance of AlertingStore and loads initial data.
   */
  constructor() {
    this.loadNotifications();
    this.loadSettings();
  }

  /**
   * Selects a notification by identifier.
   * @param id - Notification identifier.
   * @returns Reactive selection for the requested notification.
   */
  getNotificationById = (id: number): Signal<Notification | undefined> =>
    computed(() => id ? this.notifications().find(notification => notification.id === id) : undefined);

  /**
   * Reloads the notifications of the selected profile.
   */
  refreshNotifications = (): void => this.loadNotifications();

  /**
   * Publishes a general notification (POST /notifications).
   * @param notification - Notification to publish.
   * @returns True when the backend accepted the notification.
   */
  addNotification = async (notification: Notification): Promise<boolean> => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      // A POST must not be retried automatically: it may have been persisted already.
      const created = await firstValueFrom(this.alertingApi.createNotification(notification));
      this.notificationsSignal.update(notifications => [...notifications, created]);
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'errors.createNotification'));
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  };

  /**
   * Marks a notification as read once the REST API confirms the change.
   * @param notification - Notification to update.
   */
  markNotificationAsRead = (notification: Notification): void => {
    if (notification.read) return;
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.alertingApi.markNotificationAsRead(notification.id).subscribe({
      next: updated => {
        this.notificationsSignal.update(notifications =>
          notifications.map(current => current.id === updated.id ? updated : current));
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'errors.updateNotification'));
        this.loadingSignal.set(false);
      }
    });
  };

  /**
   * Deletes a notification by ID.
   * @param id - Notification identifier.
   */
  deleteNotification = (id: number): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.alertingApi.deleteNotification(id).subscribe({
      next: () => {
        this.notificationsSignal.update(notifications => notifications.filter(notification => notification.id !== id));
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'errors.deleteNotification'));
        this.loadingSignal.set(false);
      }
    });
  };

  /**
   * Enables or disables the non-critical notices (stored only for the current session).
   * @param enabled - New value.
   */
  setNonCriticalEnabled = (enabled: boolean): void => {
    const current = this.settingsSignal();
    if (!current) return;
    const updated = new Settings({
      criticalEnabled: current.criticalEnabled,
      importantEnabled: current.importantEnabled,
      regularEnabled: current.regularEnabled,
      successEnabled: current.successEnabled,
      warningEnabled: current.warningEnabled,
      infoEnabled: current.infoEnabled,
    });
    updated.nonCriticalEnabled = enabled;
    this.alertingApi.updateSettings(updated).subscribe({
      next: settings => this.settingsSignal.set(settings),
      error: error => this.settingsErrorSignal.set(this.formatError(error, 'errors.updateSettings'))
    });
  };

  /**
   * Loads the notifications of the selected profile from the API.
   */
  private loadNotifications = (): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.alertingApi.getNotifications().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: notifications => {
        this.notificationsSignal.set(notifications);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'errors.loadNotifications'));
        this.loadingSignal.set(false);
      }
    });
  };

  /**
   * Loads the notification preferences.
   */
  private loadSettings = (): void => {
    this.alertingApi.getSettings().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: settings => this.settingsSignal.set(settings),
      error: error => this.settingsErrorSignal.set(this.formatError(error, 'errors.loadSettings'))
    });
  };

  /**
   * Normalizes unknown errors into an i18n key.
   * @param error - Source error.
   * @param fallback - Key used when the error carries no HTTP information.
   * @returns Translation key.
   */
  private formatError = (error: unknown, fallback: string): string => toErrorMessageKey(error, fallback);
}
