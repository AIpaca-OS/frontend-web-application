import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';

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

interface StudentDto {
  id: number; firstName: string; lastName: string; status: string;
}
interface StopDto {
  id: number; address: string; position: number; studentIds?: number[];
}
interface RouteDto {
  id: number; name: string; code: string; status: string;
  shift: string; vehicleId: number | null; departureTime: string | null;
  stops: StopDto[];
}
interface PassengerDto {
  studentId: number; absent: boolean; arrived: boolean; stopServed: boolean;
}
interface TripDto {
  id: number; routeId: number; serviceDate: string;
  status: string; students: PassengerDto[];
}
interface NoticeDto {
  id: number; studentId: number | null; routeId: number | null;
  tripId: number | null; recipientProfileId: number | null;
  title: string; message: string; createdAt: string;
  read: boolean; journeyEvent: string | null; type: string;
}

/**
 * Read-only HTTP composition of the REST resources already implemented by
 * Profiles, Routes, Trips and Notifications. Intended for fictitious demos;
 * without IAM this is NOT an access-control boundary.
 */
@Injectable({ providedIn: 'root' })
export class TutorJourneysApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(DemoRoleSession);
  private readonly base = '/api/v1';

  private tutorStudents(): Observable<StudentDto[]> {
    const tutorId = this.session.requireProfileId('tutor');
    return this.http.get<StudentDto[]>(
      this.base + '/students?tutorProfileId=' + tutorId,
    );
  }

  journeys(): Observable<TutorJourney[]> {
    return forkJoin({
      students: this.tutorStudents(),
      routes: this.http.get<RouteDto[]>(this.base + '/routes'),
    }).pipe(switchMap(({ students, routes }) => {
      const activeStudents = new Map(students
        .filter(student => student.status === 'ACTIVE')
        .map(student => [student.id, student]));
      const assigned: Array<{ student: StudentDto; route: RouteDto; stop: StopDto }> = [];
      for (const route of routes) {
        if (route.status !== 'PUBLISHED') continue;
        for (const stop of route.stops ?? []) {
          for (const id of stop.studentIds ?? []) {
            const student = activeStudents.get(id);
            if (student) assigned.push({ student, route, stop });
          }
        }
      }
      if (!assigned.length) return of([] as TutorJourney[]);

      const routeIds = [...new Set(assigned.map(row => row.route.id))];
      return forkJoin(routeIds.map(id =>
        this.http.get<TripDto[]>(this.base + '/trips?routeId=' + id)
          .pipe(map(trips => ({ id, trips })))
      )).pipe(map(rows => {
        const tripsByRoute = new Map(rows.map(row => [row.id, row.trips]));
        return assigned.map(({ student, route, stop }): TutorJourney => {
          const trips = [...(tripsByRoute.get(route.id) ?? [])]
            .sort((a, b) => b.serviceDate.localeCompare(a.serviceDate));
          const trip = trips[0] ?? null;
          const passenger = trip?.students?.find(p => p.studentId === student.id);
          const studentStatus = !trip ? 'ROUTE_PUBLISHED'
            : !passenger ? 'NOT_ASSIGNED_ON_TRIP'
            : passenger.absent ? 'ABSENT'
            : passenger.arrived ? 'ARRIVED'
            : passenger.stopServed ? 'STOP_SERVED'
            : trip.status === 'COMPLETED' ? 'TRIP_COMPLETED'
            : trip.status;
          return {
            studentId: student.id,
            studentName: student.firstName + ' ' + student.lastName,
            routeId: String(route.id), routeName: route.name,
            routeCode: route.code ?? '', shift: route.shift,
            vehicleId: route.vehicleId == null ? null : String(route.vehicleId),
            departureTime: route.departureTime ?? '',
            assignedStopAddress: stop.address,
            stops: (route.stops ?? []).map(current => ({
              position: current.position, address: current.address,
              assignedToStudent: (current.studentIds ?? []).includes(student.id),
            })),
            tripId: trip ? String(trip.id) : null,
            serviceDate: trip?.serviceDate ?? null,
            tripStatus: trip?.status ?? 'NOT_PLANNED',
            studentStatus, stopServed: passenger?.stopServed ?? false,
          };
        });
      }));
    }));
  }

  private notice(resource: NoticeDto): TutorJourneyNotice {
    return {
      id: resource.id, studentId: Number(resource.studentId),
      routeId: resource.routeId == null ? '' : String(resource.routeId),
      tripId: resource.tripId == null ? null : String(resource.tripId),
      kind: resource.journeyEvent ?? resource.type ?? 'INFO',
      title: resource.title, message: resource.message,
      createdAt: resource.createdAt, read: Boolean(resource.read),
    };
  }

  notifications(): Observable<TutorJourneyNotice[]> {
    const tutorId = this.session.requireProfileId('tutor');
    return this.tutorStudents().pipe(switchMap(students => {
      if (!students.length) return of([] as TutorJourneyNotice[]);
      return forkJoin(students.map(student =>
        this.http.get<NoticeDto[]>(this.base + '/notifications?studentId=' + student.id)
      )).pipe(map(groups => {
        const unique = new Map<number, TutorJourneyNotice>();
        for (const row of groups.flat()) {
          if (row.studentId == null ||
              (row.recipientProfileId != null && row.recipientProfileId !== tutorId)) continue;
          unique.set(row.id, this.notice(row));
        }
        return [...unique.values()]
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }));
    }));
  }

  markAsRead(id: number): Observable<TutorJourneyNotice> {
    return this.http.patch<NoticeDto>(this.base + '/notifications/' + id + '/read', {})
      .pipe(map(row => this.notice(row)));
  }
}
