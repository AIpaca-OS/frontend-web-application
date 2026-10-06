import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { AlertingApi } from '../infrastructure/alerting-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Notification } from '../domain/model/notification.entity';
import { retry } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertingStore {
  private readonly alertingApi = inject(AlertingApi);
  private readonly notificationsSignal = signal<Notification[]>([]);
  readonly notifications = this.notificationsSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  readonly notificationsCount = computed(() => this.notifications().length);

  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found')
        ? `${fallback}: Not found`
        : error.message;
    }
    return fallback;
  }

  constructor() {
    this.loadNotifications();
  }

  private loadNotifications() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.alertingApi
      .getNotifications()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (notifications) => {
          this.notificationsSignal.set(notifications);
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to load notifications'));
          this.loadingSignal.set(false);
        },
      });
  }

  getNotificationById(id: number): Signal<Notification | undefined> {
    return computed(() =>
      id ? this.notifications().find((notification) => notification.id === id) : undefined,
    );
  }

  addNotification(notification: Notification) {
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
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to create notification'));
          this.loadingSignal.set(false);
        },
      });
  }

  updateNotification(notification: Notification) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.alertingApi
      .updateNotification(notification)
      .pipe(retry(2))
      .subscribe({
        next: (updatedNotification) => {
          this.notificationsSignal.update((notifications) =>
            notifications.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)),
          );
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to update notification'));
          this.loadingSignal.set(false);
        },
      });
  }

  markNotificationAsRead(notification: Notification) {
    notification.markAsRead();

    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.alertingApi
      .updateNotification(notification)
      .pipe(retry(2))
      .subscribe({
        next: (updatedNotification) => {
          this.notificationsSignal.update((notifications) =>
            notifications.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)),
          );
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to update notification'));
          this.loadingSignal.set(false);
        },
      });
  }

  deleteNotification(id: number) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.alertingApi
      .deleteNotification(id)
      .pipe(retry(2))
      .subscribe({
        next: () => {
          this.notificationsSignal.update((notifications) =>
            notifications.filter((n) => n.id !== id),
          );
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to delete notification'));
          this.loadingSignal.set(false);
        },
      });
  }
}
