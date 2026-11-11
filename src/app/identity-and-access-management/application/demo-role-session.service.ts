import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export type PreviewRole = 'driver' | 'tutor';
export interface AccountView {
  id: number;
  email: string;
  role: 'DRIVER' | 'TUTOR' | 'ASSISTANT';
  verified: boolean;
}
interface TokenResponse {
  token: string;
  tokenType: 'Bearer';
  expiresIn: number;
  account: AccountView;
}

const TOKEN_KEY = 'rumbo.auth.token';
const ROLE_KEY = 'rumbo.auth.role';
const AUTH_URL = '/api/v1/authentication';

/** Session is established only by the server, never by selecting a visual role. */
@Injectable({ providedIn: 'root' })
export class DemoRoleSession {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly http = inject(HttpClient);
  private readonly tokenSignal = signal<string | null>(this.read(TOKEN_KEY));
  private readonly roleSignal = signal<PreviewRole | null>(this.readRole());
  readonly token = this.tokenSignal.asReadonly();
  readonly role = this.roleSignal.asReadonly();

  private read(key: string): string | null {
    return this.browser ? sessionStorage.getItem(key) : null;
  }
  private readRole(): PreviewRole | null {
    if (!this.read(TOKEN_KEY)) return null;
    const stored = this.read(ROLE_KEY);
    return stored === 'driver' || stored === 'tutor' ? stored : null;
  }
  private setSession(token: string, role: PreviewRole): void {
    this.tokenSignal.set(token);
    this.roleSignal.set(role);
    if (this.browser) {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(ROLE_KEY, role);
    }
  }
  async signIn(email: string, password: string): Promise<PreviewRole> {
    const result = await firstValueFrom(
      this.http.post<TokenResponse>(AUTH_URL + '/sign-in', { email, password }),
    );
    const role = result.account.role === 'DRIVER' ? 'driver'
      : result.account.role === 'TUTOR' ? 'tutor' : null;
    if (!role) throw new Error('This account role has no web dashboard');
    this.setSession(result.token, role);
    return role;
  }
  async signUp(email: string, password: string, role: PreviewRole): Promise<void> {
    await firstValueFrom(this.http.post(AUTH_URL + '/sign-up', {
      email, password, role: role.toUpperCase(),
    }));
  }
  async verifyEmail(token: string): Promise<void> {
    await firstValueFrom(this.http.post(AUTH_URL + '/verify-email', { token }));
  }
  async requestPasswordReset(email: string): Promise<void> {
    await firstValueFrom(this.http.post(AUTH_URL + '/request-password-reset', { email }));
  }
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await firstValueFrom(this.http.post(AUTH_URL + '/reset-password', { token, newPassword }));
  }
  async validateRole(role: PreviewRole): Promise<boolean> {
    if (!this.tokenSignal()) return false;
    try {
      const user = await firstValueFrom(this.http.get<AccountView>(AUTH_URL + '/me'));
      const verifiedRole = user.role === 'DRIVER' ? 'driver'
        : user.role === 'TUTOR' ? 'tutor' : null;
      if (!user.verified || !verifiedRole) {
        this.leave();
        return false;
      }
      this.roleSignal.set(verifiedRole);
      if (this.browser) sessionStorage.setItem(ROLE_KEY, verifiedRole);
      return verifiedRole === role;
    } catch {
      this.leave();
      return false;
    }
  }
  leave(): void {
    this.roleSignal.set(null);
    this.tokenSignal.set(null);
    if (this.browser) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(ROLE_KEY);
      sessionStorage.removeItem('rumbo.preview.role');
    }
  }
}

/** Login and role are verified with the backend on each guarded navigation. */
export const previewRoleGuard = (requiredRole: PreviewRole): CanActivateFn => async () => {
  const session = inject(DemoRoleSession);
  const router = inject(Router);
  return (await session.validateRole(requiredRole))
    ? true : router.createUrlTree(['/login']);
};
