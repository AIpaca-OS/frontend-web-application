import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-tutor-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <main class="dashboard">
      <p class="eyebrow">RUMBO</p>
      <h1>{{ 'workspace.tutorHome' | translate }}</h1>
      <p class="description">{{ 'workspace.tutorDescription' | translate }}</p>
      <div class="status" role="status">
        <h2>{{ 'workspace.tripNotAvailable' | translate }}</h2>
        <p>{{ 'workspace.protectedTripHint' | translate }}</p>
      </div>
      <nav class="actions" [attr.aria-label]="'nav.mainNavigation' | translate">
        <a routerLink="/tutor/current-trip">{{ 'nav.trip' | translate }}</a>
        <a routerLink="/tutor/students">{{ 'nav.students' | translate }}</a>
        <a routerLink="/tutor/notifications">{{ 'nav.notifications' | translate }}</a>
      </nav>
    </main>
  `,
  styles: [`
    .dashboard { max-width: 1000px; margin: 0 auto; padding: 36px 28px; color: #183c37; }
    .eyebrow { color: #13836c; font-size: 12px; letter-spacing: .12em; font-weight: 700; }
    h1 { margin: 6px 0; font-size: 30px; }
    .description { color: #61736f; }
    .status { background: white; padding: 24px; border: 1px solid #dfe9e5; border-radius: 14px; margin: 26px 0; }
    .status h2 { font-size: 18px; margin: 0 0 10px; }
    .status p { color: #61736f; margin: 0; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; }
    .actions a { background: #e8f5ee; color: #145b48; border-radius: 12px; padding: 13px 17px; text-decoration: none; font-weight: 600; }
    .actions a:focus-visible { outline: 2px solid #13836c; }
  `],
})
export class TutorHome {}
