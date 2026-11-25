import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../components/language-switcher/language-switcher';
import { DemoRoleSession } from '../../../../identity-and-access-management/application/demo-role-session.service';

@Component({
  selector: 'app-tutor-settings',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LanguageSwitcher],
  template: `
    <main class="settings">
      <p class="eyebrow">RUMBO · {{ 'workspace.tutorRole' | translate }}</p>
      <h1>{{ 'workspace.tutorSettingsTitle' | translate }}</h1>
      <p class="description">{{ 'workspace.tutorSettingsDescription' | translate }}</p>

      <section class="panel">
        <h2>{{ 'workspace.tutorAccount' | translate }}</h2>
        <p>{{ 'workspace.identityPending' | translate }}</p>
        <nav class="links" [attr.aria-label]="'workspace.tutorAccount' | translate">
          <a routerLink="/tutor/students">{{ 'workspace.viewStudents' | translate }}</a>
          <a routerLink="/tutor/current-trip">{{ 'workspace.currentTripTitle' | translate }}</a>
        </nav>
      </section>

      <section class="panel">
        <h2>{{ 'workspace.tutorNotificationTitle' | translate }}</h2>
        <p>{{ 'workspace.tutorNotificationDescription' | translate }}</p>
        <p class="notice">{{ 'workspace.preferencesPending' | translate }}</p>
        <div class="links"><a routerLink="/tutor/notifications">{{ 'nav.notifications' | translate }}</a></div>
      </section>

      <section class="panel">
        <h2>{{ 'workspace.languageTitle' | translate }}</h2>
        <p>{{ 'workspace.languageHint' | translate }}</p>
        <app-language-switcher />
      </section>

      <section class="panel">
        <h2>{{ 'workspace.legalTitle' | translate }}</h2>
        <nav class="links" [attr.aria-label]="'workspace.legalTitle' | translate">
          <a routerLink="/privacy">{{ 'workspace.privacy' | translate }}</a>
          <a routerLink="/terms">{{ 'workspace.terms' | translate }}</a>
        </nav>
      </section>

      <section class="panel logout-panel">
        <div>
          <h2>{{ 'workspace.logoutTitle' | translate }}</h2>
          <p>{{ 'workspace.previewLogoutNote' | translate }}</p>
        </div>
        <button type="button" class="logout" (click)="logout()">{{ 'workspace.logout' | translate }}</button>
      </section>
    </main>
  `,
  styleUrl: './role-settings.css',
})
export class TutorSettings {
  private readonly session = inject(DemoRoleSession);
  private readonly router = inject(Router);

  logout(): void {
    this.session.leave();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
