import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ServiceEnrollmentsApi } from '../../profiles-relationship-management/infrastructure/service-enrollments-api';

export interface RouteStudentOption {
  id: string;
  fullName: string;
}

/**
 * Routes only consumes student candidates authorized by Profiles for the
 * authenticated driver. No unprotected GET /students is used in backend mode.
 */
@Injectable({ providedIn: 'root' })
export class RouteStudentCatalog {
  private readonly enrollmentsApi = inject(ServiceEnrollmentsApi);

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
    // Accepted (not pending) service enrollments are the only candidates.
    // No additional unimplemented /routes/eligible-students HTTP request.
    return forkJoin({
      enrollments: this.enrollmentsApi.forDriver(),
      students: this.enrollmentsApi.driverStudents(),
    }).pipe(map(({ enrollments, students }) => {
      const accepted = new Set(enrollments
        .filter(item => item.status === 'ACCEPTED')
        .map(item => item.studentId));
      return students
        .filter(student => accepted.has(student.id))
        .map(student => ({ id: String(student.id), fullName: student.firstName + ' ' + student.lastName }));
    }));
  }
}
