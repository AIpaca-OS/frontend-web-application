import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export type PreviewRole = 'driver' | 'tutor';

const ROLE_KEY = 'rumbo.preview.role';

/**
 * Visual navigation only until RMO-49/RMO-53 implement real login and JWT.
 * Never use this value as authorization for APIs or private student data.
 */
@Injectable({ providedIn: 'root' })
export class DemoRoleSession {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly roleSignal = signal<PreviewRole | null>(this.readRole());
  readonly role = this.roleSignal.asReadonly();

  private readRole(): PreviewRole | null {
    if (!this.browser) return null;
    const stored = sessionStorage.getItem(ROLE_KEY);
    return stored === 'driver' || stored === 'tutor' ? stored : null;
  }

  enter(role: PreviewRole): void {
    this.roleSignal.set(role);
    if (this.browser) sessionStorage.setItem(ROLE_KEY, role);
  }

  leave(): void {
    this.roleSignal.set(null);
    if (this.browser) sessionStorage.removeItem(ROLE_KEY);
  }
}

/** Prevents role-mismatched preview navigation. Real security belongs in the API. */
export const previewRoleGuard = (requiredRole: PreviewRole): CanActivateFn => () => {
  const session = inject(DemoRoleSession);
  const router = inject(Router);
  return session.role() === requiredRole ? true : router.createUrlTree(['/login']);
};
