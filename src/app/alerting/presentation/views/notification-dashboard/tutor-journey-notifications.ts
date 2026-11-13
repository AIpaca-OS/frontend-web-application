import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertingStore } from '../../../application/alerting-store';
import { Notification } from '../../../domain/model/notification.entity';

/** Journey facts published by the backend (NotificationResponse.journeyEvent). */
const JOURNEY_EVENTS = [
  'ROUTE_PUBLISHED', 'TRIP_PLANNED', 'TRIP_STARTED', 'STOP_SERVED',
  'ABSENT', 'STUDENT_ARRIVED', 'TRIP_CANCELLED', 'TRIP_COMPLETED',
];

/**
 * Notifications addressed to the tutor (GET /notifications?recipientProfileId).
 */
@Component({
  selector: 'app-tutor-journey-notifications',
  standalone: true,
  imports: [RouterLink, TranslatePipe, DatePipe],
  template: `
    <main class="journey-notifications">
      <header class="heading">
        <div>
          <p class="eyebrow">{{ 'notifications.tutor.eyebrow' | translate }}</p>
          <h1>{{ 'notifications.tutor.title' | translate }}</h1>
          <p>{{ 'notifications.tutor.subtitle' | translate }}</p>
        </div>
        <button type="button" (click)="reload()" [disabled]="store.loading()">
          {{ 'notifications.tutor.refresh' | translate }}
        </button>
      </header>
      @if (store.error()) { <p role="alert" class="error">{{ store.error()! | translate }}</p> }
      @if (store.loading()) { <p role="status">{{ 'notifications.tutor.loading' | translate }}</p> }
      @if (!store.loading() && !store.notifications().length && !store.error()) {
        <section class="empty">
          <h2>{{ 'notifications.tutor.emptyTitle' | translate }}</h2>
          <p>{{ 'notifications.tutor.emptyDescription' | translate }}</p>
          <a routerLink="/tutor/current-trip">{{ 'notifications.tutor.viewRoutes' | translate }}</a>
        </section>
      }
      @for (notification of store.notifications(); track notification.id) {
        <article class="notice" [class.unread]="!notification.read">
          <div>
            <span class="kind">{{ kindLabel(notification) | translate }}</span>
            <h2>{{ notification.title }}</h2>
            <p>{{ notification.message }}</p>
            <small>{{ notification.createdAt | date: 'short' }}</small>
          </div>
          @if (!notification.read) {
            <button type="button" [disabled]="store.loading()" (click)="markRead(notification)">
              {{ 'notifications.markRead' | translate }}
            </button>
          }
        </article>
      }
      <a routerLink="/tutor/current-trip">{{ 'notifications.tutor.viewStudentRoute' | translate }}</a>
    </main>
  `,
  styles: [`
    .journey-notifications{box-sizing:border-box;width:100%;max-width:var(--rumbo-page-max-width);margin:0 auto;
      padding:var(--rumbo-page-padding);color:#183f35;display:grid;gap:16px;}
    .heading{display:flex;justify-content:space-between;align-items:start;gap:20px;flex-wrap:wrap;}
    .eyebrow,.kind{color:#18866d;font-weight:750;font-size:12px;}
    .eyebrow{margin:0;letter-spacing:.08em;text-transform:uppercase;}
    h1{font-size:28px;margin:8px 0;} h2{font-size:18px;margin:7px 0;}p{font-size:13px;color:#536d63;line-height:1.5;}
    .empty,.notice{padding:20px;background:#fff;border:1px solid #deeae3;border-radius:14px;}
    .notice{display:flex;justify-content:space-between;gap:20px;align-items:center;flex-wrap:wrap;}
    .unread{border-left:4px solid #188b70;}small{color:#6f8379;}
    button{border:1px solid #228369;border-radius:9px;background:#fff;color:#145f4d;
      padding:9px 14px;cursor:pointer;}button:disabled{opacity:.5;}a{color:#0e7a5d;font-weight:700;}
    .error{color:#aa302d;}
  `],
})
export class TutorJourneyNotifications {
  readonly store = inject(AlertingStore);

  /**
   * Builds the i18n key that labels the notification.
   * @param notification - Notification to label.
   * @returns Translation key for the journey fact or the notification type.
   */
  kindLabel(notification: Notification): string {
    if (notification.journeyEvent && JOURNEY_EVENTS.includes(notification.journeyEvent)) {
      return `notifications.journeyEvents.${notification.journeyEvent}`;
    }
    return `notifications.types.${notification.type || 'info'}`;
  }

  /** Reloads the tutor notifications. */
  reload(): void { this.store.refreshNotifications(); }

  /**
   * Marks a notification as read.
   * @param notification - Notification to update.
   */
  markRead(notification: Notification): void { this.store.markNotificationAsRead(notification); }
}
