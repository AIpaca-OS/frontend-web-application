import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Tutor screen is intentionally independent from the driver Routes list.
 * A trip must never be inferred from unfiltered GET /api/v1/routes data.
 * This view stays private/empty until JWT + tutor-authorized trip API exist.
 */
@Component({
  selector: 'app-tutor-current-trip',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <main class="trip">
      <p class="eyebrow">{{ 'nav.trip' | translate }}</p>
      <h1>{{ 'workspace.currentTripTitle' | translate }}</h1>
      <section class="empty" role="status">
        <h2>{{ 'workspace.tripNotAvailable' | translate }}</h2>
        <p>{{ 'workspace.protectedTripHint' | translate }}</p>
        <a routerLink="/tutor/students">{{ 'workspace.viewStudents' | translate }}</a>
      </section>
    </main>
  `,
  styles: [`
    .trip { max-width: 980px; margin: 0 auto; padding: 36px 28px; color: #183c37; }
    .eyebrow { color: #13836c; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    h1 { font-size: 30px; }
    .empty { background: white; border: 1px solid #dfe9e5; border-radius: 14px; padding: 26px; }
    .empty h2 { margin-top: 0; font-size: 19px; }
    .empty p { color: #61736f; }
    .empty a { color: #17644e; font-weight: 700; }
  `],
})
export class TutorCurrentTrip {}
