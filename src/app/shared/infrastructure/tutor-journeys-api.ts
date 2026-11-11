import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** These endpoints return only routes and events belonging to the current guardian. */
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
  routeId: string;
  tripId: string | null;
  kind: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}
@Injectable({ providedIn: 'root' })
export class TutorJourneysApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/tutor';

  journeys(): Observable<TutorJourney[]> {
    return this.http.get<TutorJourney[]>(this.base + '/journeys');
  }
  notifications(): Observable<TutorJourneyNotice[]> {
    return this.http.get<TutorJourneyNotice[]>(this.base + '/notifications');
  }
  markAsRead(id: number): Observable<TutorJourneyNotice> {
    return this.http.patch<TutorJourneyNotice>(this.base + '/notifications/' + id + '/read', {});
  }
}
