import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DemoDriver {
  id: number;
  displayName: string;
}

export interface ServiceEnrollment {
  id: number;
  studentId: number;
  driverProfileId: number;
  status: 'PENDING' | 'ACCEPTED' | 'CANCELLED' | 'ENDED';
  requestedAt: string;
  acceptedAt: string | null;
}

export interface EnrolledStudent {
  id: number;
  firstName: string;
  lastName: string;
}

@Injectable({ providedIn: 'root' })
export class ServiceEnrollmentsApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/service-enrollments';

  /** Only exposed in the loopback-only Sprint 3 demo. */
  availableDemoDrivers(): Observable<DemoDriver[]> {
    return this.http.get<DemoDriver[]>('/api/v1/local-demo/drivers');
  }
  forStudent(studentId: number): Observable<ServiceEnrollment[]> {
    return this.http.get<ServiceEnrollment[]>(this.base + '/students/' + studentId);
  }
  request(studentId: number, driverProfileId: number): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.base, { studentId, driverProfileId });
  }
  cancel(id: number): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.base + '/' + id + '/cancel', {});
  }
  forDriver(): Observable<ServiceEnrollment[]> {
    return this.http.get<ServiceEnrollment[]>(this.base + '/drivers/me');
  }
  driverStudents(): Observable<EnrolledStudent[]> {
    return this.http.get<EnrolledStudent[]>(this.base + '/drivers/me/students');
  }
  accept(id: number): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.base + '/' + id + '/accept', {});
  }
  end(id: number): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.base + '/' + id + '/end', {});
  }
}
