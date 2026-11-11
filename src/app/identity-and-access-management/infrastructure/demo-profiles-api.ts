import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PreviewRole } from '../application/demo-role-session.service';

export const DEMO_ACCOUNTS = { driver: 10002, tutor: 10001 } as const;

export interface DemoProfile {
  id: number;
  accountId: number;
  profileType: 'DRIVER' | 'TUTOR';
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
}

/** Resolves fictional accounts seeded only in the development database. */
@Injectable({ providedIn: 'root' })
export class DemoProfilesApi {
  private readonly http = inject(HttpClient);

  get(role: PreviewRole): Observable<DemoProfile> {
    return this.http.get<DemoProfile>('/api/v1/profiles/by-account/' + DEMO_ACCOUNTS[role]);
  }

  id(role: PreviewRole): Observable<number> {
    return this.get(role).pipe(map(profile => profile.id));
  }
}
