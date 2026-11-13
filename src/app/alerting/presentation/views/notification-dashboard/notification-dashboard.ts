import { Component, inject, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { DriverDemoNotices } from './driver-demo-notices';
import { TutorJourneyNotifications } from './tutor-journey-notifications';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertingStore } from '../../../application/alerting-store';
import { Notification } from '../../../domain/model/notification.entity';

@Component({
  selector: 'app-notification-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    MatSlideToggleModule,
    DriverDemoNotices,
    TutorJourneyNotifications,
    TranslatePipe,
  ],
  templateUrl: './notification-dashboard.html',
  styleUrl: './notification-dashboard.css',
})
export class NotificationDashboard {
  readonly alertingStore = inject(AlertingStore);
  private readonly router = inject(Router);
  /** Drivers can publish route notices from this screen. */
  readonly showDriverDemo = () => this.router.url.startsWith('/driver/');
  /** Tutors see the student-journey timeline instead of the operational dashboard. */
  readonly showTutorJourneys = () => this.router.url.startsWith('/tutor/');
  protected readonly notifications: Signal<Notification[]> = this.alertingStore.notifications;

  refreshNotifications(): void {
    this.alertingStore.refreshNotifications();
  }

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

  toggleNonCritical(enabled: boolean): void {
    this.alertingStore.setNonCriticalEnabled(enabled);
  }
}
