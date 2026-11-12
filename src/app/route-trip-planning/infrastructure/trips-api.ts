import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';

export interface RouteStopDto {
  id: number;
  address: string;
  position: number;
  studentIds: number[];
}
export interface RouteForTrip {
  id: number;
  driverProfileId: number;
  vehicleId: number | null;
  name: string;
  code: string;
  status: string;
  shift: 'MORNING' | 'AFTERNOON';
  schedule: Array<{ dayOfWeek: string; departureTime: string }>;
  stops: RouteStopDto[];
}
export interface TripPassenger {
  studentId: number;
  stopId: number;
  stopPosition: number;
  stopAddress: string;
  absent: boolean;
  stopServed: boolean;
  arrived: boolean;
}
export interface TripRecord {
  id: number;
  routeId: number;
  serviceDate: string;
  status: string;
  students: TripPassenger[];
}

/** HTTP adapter for the Trips REST resources of Spring Boot. */
@Injectable({ providedIn: 'root' })
export class TripsApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(DemoRoleSession);

  route(id: number): Observable<RouteForTrip> {
    return this.http.get<RouteForTrip>('/api/v1/routes/' + id);
  }

  forRoute(id: number): Observable<TripRecord[]> {
    return this.http.get<TripRecord[]>('/api/v1/trips', { params: { routeId: id } });
  }

  plan(route: RouteForTrip, date: string): Observable<TripRecord> {
    const driverProfileId = this.session.requireProfileId('driver');
    if (route.driverProfileId !== driverProfileId) {
      throw new Error('La ruta no pertenece al conductor seleccionado.');
    }
    if (route.status !== 'PUBLISHED' || !route.vehicleId) {
      throw new Error('Publica la ruta y asígnale un vehículo antes de programar.');
    }
    const passengers = route.stops.flatMap(stop => (stop.studentIds ?? []).map(studentId => ({
      studentId,
      stopId: stop.id,
      stopPosition: stop.position,
      stopAddress: stop.address,
    })));
    if (!passengers.length) throw new Error('La ruta necesita estudiantes asignados.');
    return this.http.post<TripRecord>('/api/v1/trips', {
      routeId: route.id,
      driverProfileId,
      vehicleId: route.vehicleId,
      date,
      shift: route.shift,
      passengers,
    });
  }

  start(id: number): Observable<TripRecord> {
    return this.http.patch<TripRecord>('/api/v1/trips/' + id + '/start', {});
  }
  complete(id: number): Observable<TripRecord> {
    return this.http.patch<TripRecord>('/api/v1/trips/' + id + '/complete', {});
  }
  cancel(id: number, reason: string): Observable<TripRecord> {
    return this.http.patch<TripRecord>('/api/v1/trips/' + id + '/cancel', { reason });
  }
  absence(id: number, studentId: number): Observable<TripRecord> {
    return this.http.post<TripRecord>('/api/v1/trips/' + id + '/absences', { studentId });
  }
  serve(id: number, stopId: number): Observable<TripRecord> {
    return this.http.patch<TripRecord>('/api/v1/trips/' + id + '/stops/' + stopId + '/served', {});
  }
  arrived(id: number, studentId: number): Observable<TripRecord> {
    return this.http.patch<TripRecord>('/api/v1/trips/' + id + '/passengers/' + studentId + '/arrived', {});
  }
}
