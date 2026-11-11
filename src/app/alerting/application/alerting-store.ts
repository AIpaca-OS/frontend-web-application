import { computed, DestroyRef, inject, Injectable, Signal, signal } from '@angular/core';
import { AlertingApi } from '../infrastructure/alerting-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Notification } from '../domain/model/notification.entity';
import { Settings } from '../domain/model/settings.entity';

@Injectable({
  providedIn: 'root',
})
export class AlertingStore {
  private readonly alertingApi = inject(AlertingApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly notificationsSignal = signal<Notification[]>([]);
  readonly notifications = this.notificationsSignal.asReadonly();

  private readonly settingsSignal = signal<Settings | null>(null);
  readonly settings = this.settingsSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();
  private readonly settingsErrorSignal = signal<string | null>(null);
  readonly settingsError = this.settingsErrorSignal.asReadonly();

  readonly notificationsCount = computed(() => this.notifications().length);

  constructor() {
    this.loadNotifications();
    this.loadSettings();
  }

  private formatError(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found')
        ? `${fallback}: Not found`
        : error.message;
    }
    return fallback;
  }

  refreshNotifications(): void {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.alertingApi
      .getNotifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (notifications) => {
          this.notificationsSignal.set(notifications);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to load notifications'));
          this.loadingSignal.set(false);
        },
      });
  }

  private loadSettings(): void {
    this.alertingApi
      .getSettings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (settings) => this.settingsSignal.set(settings),
        error: (error) =>
          this.settingsErrorSignal.set(this.formatError(error, 'Failed to load notification settings')),
      });
  }

  getNotificationById(id: number): Signal<Notification | undefined> {
    return computed(() =>
      id ? this.notifications().find((notification) => notification.id === id) : undefined,
    );
  }

  addNotification(notification: Notification): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.alertingApi
      .createNotification(notification)
      
      .subscribe({
        next: (createdNotification) => {
          this.notificationsSignal.update((notifications) => [
            ...notifications,
            createdNotification,
          ]);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to create notification'));
          this.loadingSignal.set(false);
        },
      });
  }

  updateNotification(notification: Notification): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.alertingApi
      .updateNotification(notification)
      
      .subscribe({
        next: (updatedNotification) => {
          this.notificationsSignal.update((notifications) =>
            notifications.map((item) =>
              item.id === updatedNotification.id ? updatedNotification : item,
            ),
          );
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to update notification'));
          this.loadingSignal.set(false);
        },
      });
  }

  markNotificationAsRead(notification: Notification): void {
    if (notification.read) return;
    // Do not mutate a displayed item before the REST API confirms the change.
    const pending = new Notification({
      id: notification.id,
      type: notification.type,
      priority: notification.priority,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
      readAt: new Date().toISOString(),
      read: true,
      routeId: notification.routeId,
      studentId: notification.studentId,
    });
    this.updateNotification(pending);
  }

  deleteNotification(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.alertingApi
      .deleteNotification(id)
      
      .subscribe({
        next: () => {
          this.notificationsSignal.update((notifications) =>
            notifications.filter((notification) => notification.id !== id),
          );
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to delete notification'));
          this.loadingSignal.set(false);
        },
      });
  }

  setNonCriticalEnabled(enabled: boolean): void {
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

    this.alertingApi
      .updateSettings(updated)
      
      .subscribe({
        next: (settings) => this.settingsSignal.set(settings),
        error: (error) =>
          this.errorSignal.set(this.formatError(error, 'Failed to update notification settings')),
      });
  }
}
