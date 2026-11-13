import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../components/language-switcher/language-switcher';
import { DemoRoleSession } from '../../../../identity-and-access-management/application/demo-role-session.service';

@Component({
  selector: 'app-driver-settings',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LanguageSwitcher],
  template: `
    <main class="settings">
      <p class="eyebrow">Rumbo · {{ 'workspace.driverRole' | translate }}</p>
      <h1>{{ 'workspace.driverSettingsTitle' | translate }}</h1>
      <p class="description">{{ 'workspace.driverSettingsDescription' | translate }}</p>

      <section class="panel">
        <h2>{{ 'workspace.driverAccount' | translate }}</h2>
        <p>{{ 'workspace.identityPending' | translate }}</p>
      </section>

      <section class="panel">
        <h2>{{ 'workspace.driverOperationTitle' | translate }}</h2>
        <p>{{ 'workspace.driverOperationDescription' | translate }}</p>
        <nav class="links" [attr.aria-label]="'workspace.driverOperationTitle' | translate">
          <a routerLink="/driver/routes">{{ 'workspace.manageRoutes' | translate }}</a>
          <a routerLink="/driver/vehicles">{{ 'nav.vehicles' | translate }}</a>
          <a routerLink="/driver/plans">{{ 'nav.subscriptions' | translate }}</a>
        </nav>
      </section>

      <section class="panel">
        <h2>{{ 'workspace.notificationsTitle' | translate }}</h2>
        <p>{{ 'workspace.driverNotificationDescription' | translate }}</p>
        <div class="links"><a routerLink="/driver/notifications">{{ 'nav.notifications' | translate }}</a></div>
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
export class DriverSettings {
  private readonly session = inject(DemoRoleSession);
  private readonly router = inject(Router);

  logout(): void {
    this.session.leave();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
