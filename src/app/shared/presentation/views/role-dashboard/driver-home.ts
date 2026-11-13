import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RouteTripStore } from '../../../../route-trip-planning/application/route-trip.store';

@Component({
  selector: 'app-driver-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <main class="dashboard">
      <p class="eyebrow">Rumbo · {{ 'workspace.driverRole' | translate }}</p>
      <h1>{{ 'workspace.driverHome' | translate }}</h1>
      <p class="description">{{ 'workspace.driverDescription' | translate }}</p>

      <section class="metrics" [attr.aria-label]="'workspace.driverDashboardOperations' | translate">
        <div class="metric">
          <strong>{{ store.routeCount() }}</strong><span>{{ 'workspace.registeredRoutes' | translate }}</span>
        </div>
        <div class="metric">
          <strong>{{ publishedCount() }}</strong><span>{{ 'workspace.publishedRoutes' | translate }}</span>
        </div>
        <div class="metric">
          <strong>{{ configurableCount() }}</strong><span>{{ 'workspace.configurationRoutes' | translate }}</span>
        </div>
      </section>

      @if (store.loading()) {
        <p class="message" role="status">{{ 'routes.list.loading' | translate }}</p>
      }
      @if (store.error()) {
        <p class="message error" role="alert">{{ store.error()! | translate }}</p>
      }

      <section class="panel">
        <div class="panel-heading">
          <div>
            <h2>{{ 'workspace.driverDashboardOperations' | translate }}</h2>
            <p>{{ 'workspace.driverDashboardRoutesHint' | translate }}</p>
          </div>
          <a class="primary-link" routerLink="/driver/routes/new">{{ 'workspace.createRoute' | translate }}</a>
        </div>
        @if (store.routes().length > 0) {
          <ul class="route-summary">
            @for (route of store.routes().slice(0, 3); track route.id) {
              <li>
                <div>
                  <strong>{{ route.name }}</strong>
                  <small>{{ route.code }}</small>
                </div>
                <a routerLink="/driver/routes">{{ 'workspace.manageRoutes' | translate }}</a>
              </li>
            }
          </ul>
        }
      </section>

      <nav class="actions" [attr.aria-label]="'nav.mainNavigation' | translate">
        <a routerLink="/driver/routes">{{ 'nav.routes' | translate }}</a>
        <a routerLink="/driver/vehicles">{{ 'nav.vehicles' | translate }}</a>
        <a routerLink="/driver/plans">{{ 'nav.subscriptions' | translate }}</a>
        <a routerLink="/driver/notifications">{{ 'nav.notifications' | translate }}</a>
      </nav>
    </main>
  `,
  styles: [`
    .dashboard { box-sizing:border-box; width:100%; max-width:var(--rumbo-page-max-width); margin:0 auto; padding:var(--rumbo-page-padding);  color: #183c37; }
    .eyebrow { color: #13836c; font-size: 12px; letter-spacing: .12em; font-weight: 700; text-transform: uppercase; margin: 0; }
    h1 { margin: 6px 0; font-size: 30px; }
    .description { color: #61736f; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit,minmax(170px,1fr)); gap: 16px; margin: 28px 0; }
    .metric { display: grid; gap: 10px; background: white; padding: 22px; border: 1px solid #dfe9e5; border-radius: 14px; }
    .metric strong { font-size: 30px; } .metric span { color: #61736f; }
    .panel { background: white; border: 1px solid #dfe9e5; border-radius: 14px; padding: 22px; margin: 20px 0; }
    .panel-heading { display: flex; justify-content: space-between; gap: 18px; align-items: center; flex-wrap: wrap; }
    .panel-heading h2 { margin: 0 0 8px; font-size: 18px; }
    .panel-heading p { font-size: 13px; color: #61736f; max-width: 620px; }
    .route-summary { list-style: none; padding: 0; margin: 15px 0 0; }
    .route-summary li { border-top: 1px solid #e6eee8; padding: 14px 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .route-summary div { display: grid; gap: 4px; }
    .route-summary small { color: #698178; } .route-summary a { color: #126b52; font-weight: 700; font-size: 12px; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; }
    .actions a,.primary-link { background: #e8f5ee; color: #145b48; border-radius: 12px; padding: 13px 17px; text-decoration: none; font-weight: 700; font-size: 13px; }
    .primary-link { background: #279f80; color: #fff; }
    .message { color: #567269; }.error { color: #9f3434; }
    a:focus-visible { outline: 2px solid #13836c; outline-offset: 3px; }
  `],
})
export class DriverHome {
  readonly store = inject(RouteTripStore);
  readonly publishedCount = computed(() =>
    this.store.routes().filter(route => route.status.toUpperCase() === 'PUBLISHED').length);
  readonly configurableCount = computed(() => this.store.routeCount() - this.publishedCount());
}
