import { Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RouteTripStore } from '../../../../route-trip-planning/application/route-trip.store';
import { AlertingStore } from '../../../application/alerting-store';
import { Notification } from '../../../domain/model/notification.entity';

/** Kind of route notice a driver can publish. */
type RouteNoticeKind = 'DELAY' | 'INCIDENT';

/**
 * Lets a driver publish a route notice through POST /notifications.
 */
@Component({
  selector: 'app-driver-demo-notices',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section class="demo-composer">
      <h4>{{ 'notifications.composer.title' | translate }}</h4>
      <p class="hint">{{ 'notifications.composer.hint' | translate }}</p>

      @if (publishedRoutes().length === 0) {
        <p role="status">{{ 'notifications.composer.noPublishedRoutes' | translate }}</p>
      } @else {
        <div class="fields">
          <label>
            {{ 'notifications.composer.route' | translate }}
            <select [value]="routeId()" (change)="selectRoute($event)">
              <option value="">{{ 'notifications.composer.selectRoute' | translate }}</option>
              @for (route of publishedRoutes(); track route.id) {
                <option [value]="route.id">{{ route.code }} — {{ route.name }}</option>
              }
            </select>
          </label>
          <label>
            {{ 'notifications.composer.kind' | translate }}
            <select [value]="kind()" (change)="selectKind($event)">
              <option value="DELAY">{{ 'notifications.composer.delay' | translate }}</option>
              <option value="INCIDENT">{{ 'notifications.composer.incident' | translate }}</option>
            </select>
          </label>
          <label class="message">
            {{ 'notifications.composer.message' | translate }}
            <textarea rows="3" maxlength="240" [value]="message()" (input)="setMessage($event)"
              [placeholder]="'notifications.composer.placeholder' | translate"></textarea>
          </label>
        </div>
        <button type="button" (click)="send()" [disabled]="sending() || !routeId() || message().trim().length < 4">
          {{ (sending() ? 'notifications.composer.sending' : 'notifications.composer.send') | translate }}
        </button>
      }

      @if (error()) {
        <p role="alert" class="error">{{ error()! | translate }}</p>
      }
      @if (success()) {
        <p role="status" class="success">{{ 'notifications.composer.success' | translate }}</p>
      }
    </section>
  `,
  styles: [`
    .demo-composer { margin: 0; padding: 18px 22px; background: #fff;
      border: 1px solid #dce9e3; border-radius: 12px; }
    h4 { margin: 0 0 8px; color: #123f37; }
    .hint { color: #627b73; font-size: 12px; margin-bottom: 13px; }
    .fields { display: grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap: 12px; }
    label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; font-size: 12px; }
    label.message { grid-column: 1 / -1; }
    select,textarea { box-sizing: border-box; width: 100%; background: #fff; border: 1px solid #c8ded5;
      border-radius: 8px; padding: 10px; font: inherit; }
    button { border: 0; background: #249a80; color: #fff; padding: 11px 14px;
      font-weight: 600; border-radius: 8px; margin-top: 12px; cursor: pointer; }
    button:disabled { opacity: .5; cursor: not-allowed; }
    .error { color: #9e3030; } .success { color: #197552; }
  `],
})
export class DriverDemoNotices {
  private readonly routesStore = inject(RouteTripStore);
  private readonly notificationStore = inject(AlertingStore);
  private readonly translate = inject(TranslateService);
  readonly publishedRoutes = computed(() =>
    this.routesStore.routes().filter(route => route.status.toUpperCase() === 'PUBLISHED'));
  readonly routeId = signal('');
  readonly kind = signal<RouteNoticeKind>('DELAY');
  readonly message = signal('');
  readonly sending = signal(false);
  readonly error = this.notificationStore.error;
  readonly success = signal(false);

  selectRoute(event: Event): void { this.routeId.set((event.target as HTMLSelectElement).value); }
  selectKind(event: Event): void { this.kind.set((event.target as HTMLSelectElement).value as RouteNoticeKind); }
  setMessage(event: Event): void { this.message.set((event.target as HTMLTextAreaElement).value); }

  /**
   * Publishes the notice for the selected route and refreshes the notification list.
   */
  async send(): Promise<void> {
    if (!this.routeId() || this.message().trim().length < 4 || this.sending()) return;
    this.sending.set(true);
    this.success.set(false);
    const delay = this.kind() === 'DELAY';
    const notice = new Notification({
      id: 0,
      type: delay ? 'warning' : 'important',
      priority: 'regular',
      title: this.translate.instant(delay ? 'notifications.composer.delayTitle' : 'notifications.composer.incidentTitle'),
      message: this.message().trim(),
      createdAt: new Date().toISOString(),
      readAt: '',
      read: false,
      routeId: Number(this.routeId()),
      studentId: null,
    });
    const saved = await this.notificationStore.addNotification(notice);
    if (saved) {
      this.success.set(true);
      this.message.set('');
      this.notificationStore.refreshNotifications();
    }
    this.sending.set(false);
  }
}
