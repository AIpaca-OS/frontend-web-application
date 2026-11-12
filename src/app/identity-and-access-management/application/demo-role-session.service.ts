import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export type PreviewRole = 'driver' | 'tutor';

const ROLE_KEY = 'rumbo.preview.role';
const PROFILE_KEY = 'rumbo.preview.profileId';
const DEFAULT_PREVIEW_PROFILE_ID: Record<PreviewRole, number> = { driver: 2, tutor: 1 };

/**
 * Visual navigation only until RMO-49/RMO-53 implement real login and JWT.
 * Never use this value as authorization for APIs or private student data.
 */
@Injectable({ providedIn: 'root' })
export class DemoRoleSession {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly roleSignal = signal<PreviewRole | null>(this.readRole());
  readonly role = this.roleSignal.asReadonly();
  private readonly profileIdSignal = signal<number | null>(this.readProfileId());
  readonly profileId = this.profileIdSignal.asReadonly();

  private readRole(): PreviewRole | null {
    if (!this.browser) return null;
    const stored = sessionStorage.getItem(ROLE_KEY);
    return stored === 'driver' || stored === 'tutor' ? stored : null;
  }

  private readProfileId(): number | null {
    if (!this.browser) return null;
    const value = Number(sessionStorage.getItem(PROFILE_KEY));
    if (Number.isSafeInteger(value) && value > 0) return value;
    const role = this.readRole();
    return role ? DEFAULT_PREVIEW_PROFILE_ID[role] : null;
  }

  /**
   * Preview identity for fictional Sprint 3 / AV2 data ONLY.
   * These IDs are NOT proof of identity and must never authorize a backend request.
   */
  enter(role: PreviewRole, profileId: number = DEFAULT_PREVIEW_PROFILE_ID[role]): void {
    if (!Number.isSafeInteger(profileId) || profileId < 1) {
      throw new Error('El identificador del perfil de demostración es inválido.');
    }
    this.roleSignal.set(role);
    this.profileIdSignal.set(profileId);
    if (this.browser) {
      sessionStorage.setItem(ROLE_KEY, role);
      sessionStorage.setItem(PROFILE_KEY, String(profileId));
    }
  }

  requireProfileId(role: PreviewRole): number {
    if (this.roleSignal() !== role || this.profileIdSignal() == null) {
      throw new Error('Selecciona primero el perfil de demostración correspondiente.');
    }
    return this.profileIdSignal()!;
  }

  leave(): void {
    this.roleSignal.set(null);
    this.profileIdSignal.set(null);
    if (this.browser) {
      sessionStorage.removeItem(ROLE_KEY);
      sessionStorage.removeItem(PROFILE_KEY);
    }
  }
}

/** Prevents role-mismatched preview navigation. Real security belongs in the API. */
export const previewRoleGuard = (requiredRole: PreviewRole): CanActivateFn => () => {
  const session = inject(DemoRoleSession);
  const router = inject(Router);
  return session.role() === requiredRole ? true : router.createUrlTree(['/login']);
};
