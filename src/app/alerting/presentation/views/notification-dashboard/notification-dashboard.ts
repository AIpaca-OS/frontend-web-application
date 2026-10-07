import { Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { AlertingStore } from '../../../application/alerting-store';
import { Notification } from '../../../domain/model/notification.entity';

@Component({
  selector: 'app-notification-dashboard',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatExpansionModule],
  templateUrl: './notification-dashboard.html',
  styleUrl: './notification-dashboard.css',
})
export class NotificationDashboard {
  readonly alertingStore = inject(AlertingStore);
  protected readonly notifications: Signal<Notification[]> = this.alertingStore.notifications;

  markAsRead(notification: Notification): void {
    this.alertingStore.markNotificationAsRead(notification);
  }

  markAllAsRead(): void {
    this.notifications()
      .filter((notification) => !notification.read)
      .forEach((notification) => this.alertingStore.markNotificationAsRead(notification));
  }

  deleteNotification(id: number): void {
    this.alertingStore.deleteNotification(id);
  }
}
