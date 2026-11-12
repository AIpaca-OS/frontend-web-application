import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, forkJoin, of, catchError, map } from 'rxjs';
import { RouteForTrip, TripRecord } from './trips-api';

export type JourneyEvent =
  'TRIP_PLANNED' | 'TRIP_STARTED' | 'STOP_SERVED' | 'STUDENT_ARRIVED' |
  'ABSENT' | 'TRIP_CANCELLED' | 'TRIP_COMPLETED';

const titles: Record<JourneyEvent, string> = {
  TRIP_PLANNED: 'Viaje programado', TRIP_STARTED: 'Recorrido iniciado',
  STOP_SERVED: 'Parada atendida', STUDENT_ARRIVED: 'Llegada confirmada',
  ABSENT: 'Ausencia registrada', TRIP_CANCELLED: 'Viaje cancelado',
  TRIP_COMPLETED: 'Recorrido finalizado',
};

/** Demo adapter. Persist the journey event through Notifications after a successful Trip command. */
@Injectable({ providedIn: 'root' })
export class TripJourneyNoticesApi {
  private readonly http = inject(HttpClient);

  notify(route: RouteForTrip, trip: TripRecord, event: JourneyEvent, ids?: number[]): Observable<void> {
    const studentIds = [...new Set(ids ?? trip.students.map(s => s.studentId))];
    if (!studentIds.length) return of(undefined);
    return forkJoin(studentIds.map(studentId => this.http.post('/api/v1/notifications/student-journeys', {
      studentId,
      routeId: route.id,
      tripId: trip.id,
      journeyEvent: event,
      title: titles[event],
      message: titles[event] + ' en ' + route.name + '.',
      recipientProfileId: null,
    }).pipe(catchError(error => {
      // Repeated commands may refer to an event already notified.
      if (error instanceof HttpErrorResponse && error.status === 409) return of(null);
      throw error;
    })))).pipe(map(() => undefined));
  }
}
