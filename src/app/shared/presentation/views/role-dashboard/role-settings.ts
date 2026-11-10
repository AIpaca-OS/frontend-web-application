import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-role-settings',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <main class="settings">
      <p class="eyebrow">RUMBO</p>
      <h1>{{ 'workspace.settingsTitle' | translate }}</h1>
      <p class="description">{{ 'workspace.settingsDescription' | translate }}</p>
      <section class="panel">
        <h2>{{ 'workspace.accountTitle' | translate }}</h2>
        <p>{{ (isTutor ? 'workspace.tutorAccount' : 'workspace.driverAccount') | translate }}</p>
        <p class="hint">{{ 'workspace.identityPending' | translate }}</p>
      </section>
      <section class="panel">
        <h2>{{ 'workspace.languageTitle' | translate }}</h2>
        <p>{{ 'workspace.languageHint' | translate }}</p>
      </section>
      <section class="panel">
        <h2>{{ 'workspace.notificationsTitle' | translate }}</h2>
        <p>{{ 'workspace.notificationsHint' | translate }}</p>
        <a [routerLink]="isTutor ? '/tutor/notifications' : '/driver/notifications'">
          {{ 'nav.notifications' | translate }}
        </a>
      </section>
      <section class="panel">
        <h2>{{ 'workspace.legalTitle' | translate }}</h2>
        <a routerLink="/privacy">{{ 'workspace.privacy' | translate }}</a>
        <a routerLink="/terms">{{ 'workspace.terms' | translate }}</a>
      </section>
    </main>
  `,
  styles: [`
    .settings { max-width: 860px; margin: 0 auto; padding: 36px 28px; color: #183c37; }
    .eyebrow { color: #13836c; font-size: 12px; letter-spacing: .1em; font-weight: 700; }
    h1 { font-size: 30px; margin-bottom: 10px; }
    .description, .panel p { color: #61736f; }
    .panel { background: white; border: 1px solid #dfe9e5; border-radius: 14px; padding: 20px 24px; margin: 15px 0; }
    .panel h2 { font-size: 17px; margin: 0 0 9px; }
    .panel a { color: #17644e; margin-right: 20px; font-weight: 700; }
    .hint { font-size: 13px; }
  `],
})
export class RoleSettings {
  readonly isTutor = inject(ActivatedRoute).snapshot.data['role'] === 'tutor';
}
