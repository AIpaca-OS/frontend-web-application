import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, throwError } from 'rxjs';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';
import { RouteForTrip, TripRecord } from '../../route-trip-planning/infrastructure/trips-api';

export type DemoNoticeKind = 'DELAY' | 'INCIDENT';
export type IncidentCategory = 'MECHANICAL_FAILURE' | 'TRAFFIC_ACCIDENT' | 'ROAD_BLOCKED' | 'STUDENT_HEALTH' | 'OTHER';
export interface DemoNoticeReceipt { id: number; title: string; message: string; }

/** Uses the Incidents/Delays and Notifications REST interfaces already exposed by Spring Boot. */
@Injectable({ providedIn: 'root' })
export class DriverDemoNoticesApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(DemoRoleSession);

  send(routeId: string, kind: DemoNoticeKind, message: string,
       estimatedMinutes = 10, category: IncidentCategory = 'OTHER'): Observable<DemoNoticeReceipt> {
    const id = Number(routeId);
    const driverProfileId = this.session.requireProfileId('driver');
    if (!Number.isSafeInteger(id) || id < 1) {
      return throwError(() => new Error('Selecciona una ruta válida.'));
    }
    return forkJoin({
      route: this.http.get<RouteForTrip>('/api/v1/routes/' + id),
      trips: this.http.get<TripRecord[]>('/api/v1/trips', {params: {routeId: id}}),
    }).pipe(switchMap(({route,trips}) => {
      if (route.driverProfileId !== driverProfileId || route.status !== 'PUBLISHED') {
        return throwError(() => new Error('La ruta no pertenece al conductor o no está publicada.'));
      }
      const trip = trips.find(t => t.status === 'IN_PROGRESS');
      if (!trip) return throwError(() => new Error('Primero inicia un viaje en esta ruta.'));
      const request = kind === 'DELAY'
        ? this.http.post<{id:number}>('/api/v1/delays', {
            tripId: trip.id, reportedByProfileId: driverProfileId,
            cause: message, estimatedMinutes,
          })
        : this.http.post<{id:number}>('/api/v1/incidents', {
            tripId: trip.id, reportedByProfileId: driverProfileId,
            studentId: null, category, description: message,
          });
      // Backend publishes a StudentJourneyEvent in the same transaction.
      // Do not issue a second notification POST from the browser.
      return request.pipe(map(saved => ({
        id: saved.id,
        title: kind === 'DELAY' ? 'Retraso informado' : 'Incidencia informada',
        message,
      })));
    }));
  }
}
