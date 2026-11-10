import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RouteTripStore } from '../../../../route-trip-planning/application/route-trip.store';

@Component({
  selector: 'app-driver-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <main class="dashboard">
      <p class="eyebrow">RUMBO</p>
      <h1>{{ 'workspace.driverHome' | translate }}</h1>
      <p class="description">{{ 'workspace.driverDescription' | translate }}</p>
      <div class="metrics">
        <div class="metric">
          <strong>{{ store.routeCount() }}</strong>
          <span>{{ 'workspace.registeredRoutes' | translate }}</span>
        </div>
        <div class="metric">
          <strong>{{ publishedCount() }}</strong>
          <span>{{ 'workspace.publishedRoutes' | translate }}</span>
        </div>
      </div>
      @if (store.error()) {
        <p class="notice" role="alert">{{ store.error() }}</p>
      }
      <nav class="actions" [attr.aria-label]="'nav.mainNavigation' | translate">
        <a routerLink="/driver/routes">{{ 'workspace.manageRoutes' | translate }}</a>
        <a routerLink="/driver/vehicles">{{ 'nav.vehicles' | translate }}</a>
        <a routerLink="/driver/students">{{ 'nav.students' | translate }}</a>
        <a routerLink="/driver/notifications">{{ 'nav.notifications' | translate }}</a>
      </nav>
    </main>
  `,
  styles: [`
    .dashboard { max-width: 1000px; margin: 0 auto; padding: 36px 28px; color: #183c37; }
    .eyebrow { color: #13836c; font-size: 12px; letter-spacing: .12em; font-weight: 700; }
    h1 { margin: 6px 0; font-size: 30px; }
    .description { color: #61736f; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap: 16px; margin: 28px 0; }
    .metric { display: grid; gap: 10px; background: white; padding: 22px; border: 1px solid #dfe9e5; border-radius: 14px; }
    .metric strong { font-size: 30px; }
    .metric span { color: #61736f; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; }
    .actions a { background: #e8f5ee; color: #145b48; border-radius: 12px; padding: 13px 17px; text-decoration: none; font-weight: 600; }
    .actions a:focus-visible { outline: 2px solid #13836c; }
    .notice { color: #9f3434; }
  `],
})
export class DriverHome {
  readonly store = inject(RouteTripStore);
  readonly publishedCount = () => this.store.routes().filter(route => route.status === 'PUBLISHED').length;
}
