import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoutesApi } from './routes-api';

export interface RouteStudentOption {
  id: string;
  fullName: string;
}

/**
 * Reads candidates from accepted Profiles enrollments for the demo driver.
 */
@Injectable({ providedIn: 'root' })
export class RouteStudentCatalog {
  private readonly routesApi = inject(RoutesApi);

  getCandidates(): Observable<RouteStudentOption[]> {
    if (environment.routePlanningUseLocalDemoStudents) {
      // Visual demonstration only; backend authorization still rejects these IDs
      // unless Profiles explicitly recognizes the student and the driver.
      return of([
        { id: 'demo-101', fullName: 'Demo Student 101' },
        { id: 'demo-102', fullName: 'Demo Student 102' },
        { id: 'demo-103', fullName: 'Demo Student 103' },
      ]);
    }
    return this.routesApi.getEligibleStudents();
  }
}
