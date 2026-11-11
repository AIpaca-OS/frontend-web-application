import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, throwError } from 'rxjs';
import { DemoProfilesApi } from '../../identity-and-access-management/infrastructure/demo-profiles-api';

export interface TutorJourney {
  studentId: number;
  studentName: string;
  routeId: string;
  routeName: string;
  routeCode: string;
  shift: string;
  vehicleId: string | null;
  departureTime: string;
  assignedStopAddress: string;
  stops: Array<{ position: number; address: string; assignedToStudent: boolean }>;
  tripId: string | null;
  serviceDate: string | null;
  tripStatus: string;
  studentStatus: string;
  stopServed: boolean;
}
export interface TutorJourneyNotice {
  id: number;
  studentId: number;
  routeId: string | null;
  tripId: string | null;
  kind: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}
type JourneyNotificationResource = Omit<TutorJourneyNotice, 'routeId' | 'tripId' | 'kind'> & {
  routeId: number | null;
  tripId: number | null;
  journeyEvent: string;
  category: string;
};

@Injectable({ providedIn: 'root' })
export class TutorJourneysApi {
  private readonly http = inject(HttpClient);
  private readonly profiles = inject(DemoProfilesApi);
  private readonly base = '/api/v1/notifications';

  journeys(): Observable<TutorJourney[]> {
    return throwError(() => new Error('La consulta del traslado actual está pendiente.'));
  }

  notifications(): Observable<TutorJourneyNotice[]> {
    return this.profiles.id('tutor').pipe(
      switchMap(recipientProfileId => this.http.get<JourneyNotificationResource[]>(this.base, {
        params: { recipientProfileId },
      })),
      map(rows => rows.filter(row => row.category === 'STUDENT_JOURNEY').map(row => this.toNotice(row))),
    );
  }

  markAsRead(id: number): Observable<TutorJourneyNotice> {
    return this.http.patch<JourneyNotificationResource>(this.base + '/' + id + '/read', {})
      .pipe(map(row => this.toNotice(row)));
  }

  private toNotice(row: JourneyNotificationResource): TutorJourneyNotice {
    return {
      id: row.id, studentId: row.studentId, title: row.title, message: row.message,
      createdAt: row.createdAt, read: row.read, kind: row.journeyEvent,
      routeId: row.routeId === null ? null : String(row.routeId),
      tripId: row.tripId === null ? null : String(row.tripId),
    };
  }
}
