import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, throwError } from 'rxjs';
import { DemoProfilesApi } from '../../identity-and-access-management/infrastructure/demo-profiles-api';

export type DemoNoticeKind = 'DELAY' | 'INCIDENT';

export interface ActiveTrip {
  id: number;
  serviceDate: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class DriverDemoNoticesApi {
  private readonly http = inject(HttpClient);
  private readonly profiles = inject(DemoProfilesApi);

  trips(routeId: string): Observable<ActiveTrip[]> {
    return this.http.get<ActiveTrip[]>('/api/v1/trips', { params: { routeId } });
  }

  send(tripId: number, kind: DemoNoticeKind, message: string, estimatedMinutes: number): Observable<unknown> {
    if (kind === 'DELAY' && (!Number.isInteger(estimatedMinutes) || estimatedMinutes < 1 || estimatedMinutes > 600)) {
      return throwError(() => new Error('Indica una estimación de 1 a 600 minutos.'));
    }

    return this.profiles.id('driver').pipe(
      switchMap(reportedByProfileId => kind === 'DELAY'
        ? this.http.post('/api/v1/delays', { tripId, reportedByProfileId, cause: message, estimatedMinutes })
        : this.http.post('/api/v1/incidents', {
            tripId, reportedByProfileId, category: 'OTHER', description: message,
          })),
    );
  }
}
