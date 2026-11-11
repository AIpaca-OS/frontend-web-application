import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { DemoProfilesApi } from '../../identity-and-access-management/infrastructure/demo-profiles-api';

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
  private readonly profiles = inject(DemoProfilesApi);
  private readonly base = '/api/v1/service-enrollments';

  /** Only exposed in the loopback-only Sprint 3 demo. */
  availableDemoDrivers(): Observable<DemoDriver[]> {
    return this.profiles.get('driver').pipe(map(profile => [{
      id: profile.id, displayName: profile.firstName + ' ' + profile.lastName,
    }]));
  }
  forStudent(studentId: number): Observable<ServiceEnrollment[]> {
    return this.http.get<ServiceEnrollment[]>(this.base + '/students/' + studentId);
  }
  request(studentId: number, driverProfileId: number): Observable<{ id: number }> {
    return this.profiles.id('tutor').pipe(switchMap(requestedByProfileId =>
      this.http.post<ServiceEnrollment>(this.base, { studentId, driverProfileId, requestedByProfileId })));
  }
  cancel(id: number): Observable<{ id: number }> {
    return this.profiles.id('tutor').pipe(switchMap(requestedByProfileId =>
      this.http.post<ServiceEnrollment>(this.base + '/' + id + '/cancel', null, {
        params: { requestedByProfileId },
      })));
  }
  forDriver(): Observable<ServiceEnrollment[]> {
    return this.profiles.id('driver').pipe(switchMap(id =>
      this.http.get<ServiceEnrollment[]>(this.base + '/drivers/' + id)));
  }
  driverStudents(): Observable<EnrolledStudent[]> {
    return this.profiles.id('driver').pipe(switchMap(id =>
      this.http.get<EnrolledStudent[]>(this.base + '/drivers/' + id + '/students')));
  }
  accept(id: number): Observable<{ id: number }> {
    return this.profiles.id('driver').pipe(switchMap(driverProfileId =>
      this.http.post<ServiceEnrollment>(this.base + '/' + id + '/accept', null, {
        params: { driverProfileId },
      })));
  }
  end(id: number): Observable<{ id: number }> {
    return this.profiles.id('driver').pipe(switchMap(requestedByProfileId =>
      this.http.post<ServiceEnrollment>(this.base + '/' + id + '/end', null, {
        params: { requestedByProfileId },
      })));
  }
}
