import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { AlertingApi } from '../infrastructure/alerting-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Notification } from '../domain/model/notification.entity';
import { Settings } from '../domain/model/settings.entity';
import { retry } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertingStore {
  private readonly alertingApi = inject(AlertingApi);

  private readonly notificationsSignal = signal<Notification[]>([]);
  readonly notifications = this.notificationsSignal.asReadonly();

  private readonly settingsSignal = signal<Settings | null>(null);
  readonly settings = this.settingsSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

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

  private loadNotifications(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.alertingApi
      .getNotifications()
      .pipe(takeUntilDestroyed())
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
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (settings) => this.settingsSignal.set(settings),
        error: (error) =>
          this.errorSignal.set(this.formatError(error, 'Failed to load notification settings')),
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
      .pipe(retry(2))
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
      .pipe(retry(2))
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
    notification.markAsRead();
    this.updateNotification(notification);
  }

  deleteNotification(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.alertingApi
      .deleteNotification(id)
      .pipe(retry(2))
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
      .pipe(retry(2))
      .subscribe({
        next: (settings) => this.settingsSignal.set(settings),
        error: (error) =>
          this.errorSignal.set(this.formatError(error, 'Failed to update notification settings')),
      });
  }
}
