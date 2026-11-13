import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-tutor-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <main class="dashboard">
      <p class="eyebrow">Rumbo · {{ 'workspace.tutorRole' | translate }}</p>
      <h1>{{ 'workspace.tutorHome' | translate }}</h1>
      <p class="description">{{ 'workspace.tutorDescription' | translate }}</p>

      <section class="trip-panel">
        <div class="panel-label">{{ 'workspace.tutorDashboardTrip' | translate }}</div>
        <h2>{{ 'workspace.tutorRoutesTitle' | translate }}</h2>
        <p>{{ 'workspace.tutorRoutesDescription' | translate }}</p>
        <a class="primary-link" routerLink="/tutor/current-trip">{{ 'nav.trip' | translate }}</a>
      </section>

      <h2 class="shortcuts-heading">{{ 'workspace.tutorDashboardActions' | translate }}</h2>
      <nav class="actions" [attr.aria-label]="'nav.mainNavigation' | translate">
        <a routerLink="/tutor/students">
          <strong>{{ 'workspace.viewStudents' | translate }}</strong>
          <small>{{ 'workspace.tutorStudentsHint' | translate }}</small>
        </a>
        <a routerLink="/tutor/notifications">
          <strong>{{ 'nav.notifications' | translate }}</strong>
          <small>{{ 'workspace.tutorAlertsHint' | translate }}</small>
        </a>
        <a routerLink="/tutor/configuration">
          <strong>{{ 'workspace.tutorSettingsTitle' | translate }}</strong>
          <small>{{ 'workspace.tutorSettingsDescription' | translate }}</small>
        </a>
      </nav>
    </main>
  `,
  styles: [`
    .dashboard { box-sizing:border-box; width:100%; max-width:var(--rumbo-page-max-width); margin:0 auto; padding:var(--rumbo-page-padding);  color: #183c37; }
    .eyebrow { color: #13836c; font-size: 12px; letter-spacing: .12em; font-weight: 700; text-transform: uppercase; margin: 0; }
    h1 { margin: 6px 0; font-size: 30px; } .description { color: #61736f; }
    .trip-panel { background: white; border: 1px solid #dfe9e5; border-radius: 14px; padding: 26px; margin: 26px 0; }
    .trip-panel h2 { margin: 9px 0; font-size: 19px; }
    .trip-panel p { color: #61736f; max-width: 650px; line-height: 1.6; }
    .panel-label { font-size: 12px; color: #128369; font-weight: 800; text-transform: uppercase; }
    .primary-link { display: inline-block; background: #279f80; color: #fff; border-radius: 10px; padding: 12px 17px; text-decoration: none; font-weight: 700; font-size: 13px; margin-top: 9px; }
    .shortcuts-heading { font-size: 18px; margin: 25px 0 12px; }
    .actions { display: grid; grid-template-columns: repeat(auto-fit,minmax(210px,1fr)); gap: 14px; }
    .actions a { display: grid; gap: 10px; background: #fff; border: 1px solid #dfe9e5; border-radius: 13px; padding: 21px; text-decoration: none; color: #145b48; }
    .actions small { font-size: 12px; color: #62746f; line-height: 1.4; }
    a:focus-visible { outline: 2px solid #13836c; outline-offset: 3px; }
  `],
})
/**
 * Tutor landing page with shortcuts to the student routes, notifications and settings.
 */
export class TutorHome {}
