import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DemoRoleSession, PreviewRole } from '../../../application/demo-role-session.service';

@Component({
  selector: 'app-login',
  imports: [TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly router = inject(Router);
  private readonly roleSession = inject(DemoRoleSession);
  private readonly translate = inject(TranslateService);

  selectedRole: PreviewRole = 'tutor';
  language = this.translate.getCurrentLang() === 'es-419' ? 'ES' : 'EN';

  selectRole(role: PreviewRole): void {
    this.selectedRole = role;
  }

  /** Preview only. RMO-49 requires verified credentials before production. */
  redirect(): void {
    this.roleSession.enter(this.selectedRole);
    void this.router.navigateByUrl(this.selectedRole === 'tutor' ? '/tutor/home' : '/driver/home');
  }

  toggleLanguage(): void {
    this.language = this.language === 'ES' ? 'EN' : 'ES';
    this.translate.use(this.language === 'ES' ? 'es-419' : 'en');
  }
}
