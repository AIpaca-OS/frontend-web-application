import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type DemoNoticeKind = 'DELAY' | 'INCIDENT';

export interface DemoNoticeReceipt {
  id: number;
  title: string;
  message: string;
}

/**
 * Local Sprint 3 testing contract only. The backend registers it exclusively
 * with APP_DEMO_ENABLED=true. IAM must replace this with driver-authenticated
 * recipient-filtered incident/delay commands before production.
 */
@Injectable({ providedIn: 'root' })
export class DriverDemoNoticesApi {
  private readonly http = inject(HttpClient);

  send(routeId: string, kind: DemoNoticeKind, message: string): Observable<DemoNoticeReceipt> {
    return this.http.post<DemoNoticeReceipt>(
      '/api/v1/routes/' + encodeURIComponent(routeId) + '/demo-notices',
      { kind, message },
    );
  }
}
