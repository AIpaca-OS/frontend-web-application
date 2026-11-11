import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DemoRoleSession, PreviewRole } from '../../../application/demo-role-session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(DemoRoleSession);
  private readonly translate = inject(TranslateService);

  selectedRole: PreviewRole = 'tutor';
  language = this.translate.getCurrentLang() === 'es-419' ? 'ES' : 'EN';
  mode: 'login' | 'signup' | 'forgot' | 'reset' = 'login';
  email = '';
  password = '';
  confirmPassword = '';
  busy = false;
  error = '';
  message = '';
  private resetToken: string | null = null;

  constructor() {
    this.resetToken = this.route.snapshot.queryParamMap.get('reset');
    if (this.resetToken) this.mode = 'reset';
    const verificationToken = this.route.snapshot.queryParamMap.get('verify');
    if (verificationToken) {
      this.busy = true;
      void this.session.verifyEmail(verificationToken).then(() => {
        this.message = this.translate.instant('auth.verified');
      }).catch(error => { this.error = this.errorMessage(error); })
        .finally(() => { this.busy = false; });
    }
  }

  selectRole(role: PreviewRole): void { this.selectedRole = role; }
  setMode(mode: 'login' | 'signup' | 'forgot'): void {
    this.mode = mode;
    this.error = '';
    this.message = '';
    this.password = '';
    this.confirmPassword = '';
  }

  async submit(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.error = '';
    this.message = '';
    try {
      if (this.mode === 'login') {
        const role = await this.session.signIn(this.email.trim(), this.password);
        await this.router.navigateByUrl(role === 'tutor' ? '/tutor/home' : '/driver/home');
      } else if (this.mode === 'signup') {
        if (this.password !== this.confirmPassword)
          throw new Error(this.translate.instant('auth.passwordMismatch'));
        await this.session.signUp(this.email.trim(), this.password, this.selectedRole);
        this.mode = 'login';
        this.password = '';
        this.confirmPassword = '';
        this.message = this.translate.instant('auth.checkEmail');
      } else if (this.mode === 'forgot') {
        await this.session.requestPasswordReset(this.email.trim());
        this.message = this.translate.instant('auth.resetRequested');
      } else if (this.mode === 'reset') {
        if (!this.resetToken) throw new Error('Missing password reset token');
        if (this.password !== this.confirmPassword)
          throw new Error(this.translate.instant('auth.passwordMismatch'));
        await this.session.resetPassword(this.resetToken, this.password);
        this.mode = 'login';
        this.password = '';
        this.confirmPassword = '';
        this.message = this.translate.instant('auth.passwordChanged');
      }
    } catch (error) {
      this.error = this.errorMessage(error);
    } finally {
      this.busy = false;
    }
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error && !('status' in error)) return error.message;
    const response = error as { status?: number; error?: { detail?: string } };
    if (typeof response.error?.detail === 'string') return response.error.detail;
    if (response.status === 401) return this.translate.instant('auth.invalidCredentials');
    if (response.status === 403) return this.translate.instant('auth.verifyFirst');
    if (response.status === 503) return this.translate.instant('auth.serviceUnavailable');
    return this.translate.instant('auth.genericError');
  }

  toggleLanguage(): void {
    this.language = this.language === 'ES' ? 'EN' : 'ES';
    this.translate.use(this.language === 'ES' ? 'es-419' : 'en');
  }
}
