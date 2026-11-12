import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { Route } from '../domain/model/route.entity';

/**
 * Demo-only notification adapter. Emits an existing Notifications REST command
 * after Routes reports that a route has been published. This is NOT an atomic
 * backend domain-event transaction; it requires IAM and a backend outbox in
 * production.
 */
@Injectable({ providedIn: 'root' })
export class RoutePublicationNoticesApi {
  private readonly http = inject(HttpClient);

  notifyPublished(route: Route): Observable<void> {
    const routeId = Number(route.id);
    if (!Number.isSafeInteger(routeId) || routeId < 1) {
      throw new Error('El servidor devolvió un identificador de ruta inválido.');
    }
    const students = [...new Set(route.stops
      .map(stop => Number(stop.studentId))
      .filter(id => Number.isSafeInteger(id) && id > 0))];
    if (!students.length) return of(undefined);
    return forkJoin(students.map(studentId =>
      this.http.post('/api/v1/notifications/student-journeys', {
        studentId,
        routeId,
        tripId: null,
        journeyEvent: 'ROUTE_PUBLISHED',
        title: 'Ruta escolar publicada',
        message: 'Se publicó la ruta ' + route.name + ' para el estudiante.',
        recipientProfileId: null,
      })
    )).pipe(map(() => undefined));
  }
}
