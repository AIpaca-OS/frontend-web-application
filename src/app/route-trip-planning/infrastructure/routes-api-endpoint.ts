import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Route } from '../domain/model/route.entity';
import { RouteSchedule } from '../domain/model/route-schedule.entity';
import { RouteAssembler } from './route-assembler';
import { RouteResource, RoutesResponse } from './routes-response';

import { environment } from '../../../environments/environment';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';

export interface RouteAssignmentResource {
  id: string;
  stopId: string;
  studentId: string;
}

export interface EligibleStudentResource {
  id: string;
  fullName: string;
}

export interface AssignmentInputResource {
  studentId: string;
  stopId: string;
}

export class RoutesApiEndpoint {
  private readonly endpointUrl =
    environment.routePlanningApiBaseUrl + environment.routePlanningRoutesEndpointPath;

  private readonly assembler = new RouteAssembler();

  private readonly backendMode = environment.routePlanningApiMode === 'backend';

  constructor(
    private readonly http: HttpClient,
    private readonly currentLanguage: () => string,
    private readonly session?: DemoRoleSession,
  ) {}

  getAll(): Observable<Route[]> {
    return this.http
      .get<RoutesResponse | RouteResource[]>(this.endpointUrl + this.driverFilter(), this.requestOptions())
      .pipe(
        map((response) => {
          const resources = Array.isArray(response) ? response : (response.routes ?? []);

          return resources.map((resource) => this.assembler.toEntityFromResource(resource));
        }),
        catchError(this.handleError('Unable to load routes')),
      );
  }

  getById(id: string): Observable<Route> {
    return this.http
      .get<RouteResource>(this.endpointUrl + '/' + encodeURIComponent(id), this.requestOptions())
      .pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(this.handleError('Unable to load route')),
      );
  }

  create(entity: Route): Observable<Route> {
    if (!this.backendMode) {
      return this.http.post<RouteResource>(
        this.endpointUrl, this.toMockPayload(entity), this.requestOptions()
      ).pipe(
        map(resource => this.assembler.toEntityFromResource(resource)),
        catchError(this.handleError('Unable to create route')),
      );
    }

    // El ID es el perfil DRIVER elegido en el acceso de DEMOSTRACIÓN.
    // Esto no es IAM ni una autenticación segura.
    let payload: Record<string, unknown>;
    try {
      payload = {
        ...this.toBackendPayload(entity, false),
        driverProfileId: this.requireDriverId(),
      };
    } catch (error) {
      return throwError(() => error instanceof Error ? error : new Error('Datos de ruta inválidos'));
    }
    return this.http.post<RouteResource>(
      this.endpointUrl, payload, this.requestOptions()
    ).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Unable to create route')),
    );
  }

  update(entity: Route, id: string): Observable<Route> {
    let payload: object;

    try {
      payload = this.backendMode
        ? this.toBackendPayload(entity, true)
        : this.assembler.toResourceFromEntity(entity);
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .put<RouteResource>(
        this.endpointUrl + '/' + encodeURIComponent(id),
        payload,
        this.requestOptions(),
      )
      .pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(this.handleError('Unable to update route')),
      );
  }

  updateSchedule(id: string, schedule: RouteSchedule[], confirm: boolean): Observable<Route> {
    return this.http
      .put<RouteResource>(
        this.endpointUrl + '/' + encodeURIComponent(id) + '/schedule',
        { schedule, confirm },
        this.requestOptions(),
      )
      .pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(this.handleError('Unable to update route schedule')),
      );
  }

  getEligibleStudents(): Observable<EligibleStudentResource[]> {
    // La API respondera 503 hasta implementar
    // autorizacion real en Profiles/IAM.
    return this.http
      .get<EligibleStudentResource[]>(
        this.endpointUrl + '/eligible-students',
        this.requestOptions(),
      )
      .pipe(catchError(this.handleError('Unable to load eligible students')));
  }

  replaceAssignments(id: string, assignments: AssignmentInputResource[]): Observable<Route> {
    // Spring Boot requiere IDs Long, MockAPI usaba cadenas arbitrarias.
    let payload: AssignmentInputResource[] | { studentId: number; stopId: number }[];
    try {
      payload = this.backendMode && this.session
        ? assignments.map(row => ({
            studentId: this.positiveId(row.studentId, 'studentId'),
            stopId: this.positiveId(row.stopId, 'stopId'),
          }))
        : assignments;
    } catch (error) {
      return throwError(() => error instanceof Error ? error : new Error('Asignaciones inválidas'));
    }
    return this.http.put<RouteResource>(
      this.endpointUrl + '/' + encodeURIComponent(id) + '/assignments',
      payload, this.requestOptions(),
    ).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Unable to save route assignments')),
    );
  }

  getAssignments(id: string): Observable<RouteAssignmentResource[]> {
    return this.http
      .get<RouteAssignmentResource[]>(
        this.endpointUrl + '/' + encodeURIComponent(id) + '/assignments',
        this.requestOptions(),
      )
      .pipe(catchError(this.handleError('Unable to load route assignments')));
  }

  assignStudent(
    id: string, studentId: string, stopId: string,
  ): Observable<RouteAssignmentResource> {
    let payload: {studentId: string | number; stopId: string | number};
    try {
      payload = this.backendMode && this.session
        ? {studentId: this.positiveId(studentId, 'studentId'), stopId: this.positiveId(stopId, 'stopId')}
        : {studentId, stopId};
    } catch (error) {
      return throwError(() => error instanceof Error ? error : new Error('Asignación inválida'));
    }
    return this.http.post<RouteAssignmentResource>(
      this.endpointUrl + '/' + encodeURIComponent(id) + '/assignments',
      payload, this.requestOptions(),
    ).pipe(catchError(this.handleError('Unable to assign student')));
  }

  publish(id: string): Observable<Route> {
    return this.http
      .patch<RouteResource>(
        this.endpointUrl + '/' + encodeURIComponent(id) + '/status',
        { status: 'PUBLISHED' },
        this.requestOptions(),
      )
      .pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(this.handleError('Unable to publish route')),
      );
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(this.endpointUrl + '/' + encodeURIComponent(id), this.requestOptions())
      .pipe(catchError(this.handleError('Unable to delete route')));
  }

  private requireDriverId(): number {
    if (!this.session) throw new Error('Selecciona un perfil DRIVER de prueba en el inicio.');
    return this.session.requireProfileId('driver');
  }

  private driverFilter(): string {
    if (!this.backendMode || this.session?.role() !== 'driver') return '';
    return '?driverProfileId=' + this.requireDriverId();
  }

  private toBackendPayload(entity: Route, isUpdate: boolean): Record<string, unknown> {
    // Spring Boot utiliza Long, no identificadores
    // de MockAPI ni cadenas no numericas.
    const vehicleId =
      entity.vehicleId === null ? null : this.positiveId(entity.vehicleId, 'vehicleId');

    const stops = entity.stops.map((stop) => {
      const resource: {
        id?: number;
        address: string;
      } = {
        address: stop.address,
      };

      // En la edicion se conserva el ID de las
      // paradas existentes. Al crear se omite.
      if (isUpdate && stop.id !== null && stop.id !== '') {
        resource.id = this.positiveId(stop.id, 'stop.id');
      }

      return resource;
    });

    return {
      name: entity.name,
      shift: entity.shift,
      vehicleId,
      stops,
      schedule: entity.schedule,
      scheduleConfirmed: entity.scheduleConfirmed,
    };
  }

  private positiveId(value: string | number, field: string): number {
    const parsed = Number(value);

    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
      throw new Error(field + ' debe ser un identificador numerico positivo.');
    }

    return parsed;
  }

  private toMockPayload(entity: Route): object {
    const resource = this.assembler.toResourceFromEntity(entity);

    return {
      name: resource.name,
      code: resource.code,
      departureTime: resource.departureTime,
      status: resource.status,
      stopsCount: resource.stopsCount,
      shift: resource.shift,
      stops: resource.stops,
      schedule: resource.schedule,
      scheduleConfirmed: resource.scheduleConfirmed,
    };
  }

  private requestOptions(): { headers: HttpHeaders } {
    const language = this.currentLanguage() === 'es-419' ? 'es-419' : 'en';

    return {
      headers: new HttpHeaders({
        'Accept-Language': language,
      }),
    };
  }

  private handleError(operation: string) {
    return (error: unknown): Observable<never> => {
      if (error instanceof HttpErrorResponse) {
        const detail =
          error.error && typeof error.error.detail === 'string' ? error.error.detail : null;

        return throwError(
          () => new Error(detail ?? operation + ' (HTTP ' + (error.status || 'unknown') + ')'),
        );
      }

      return throwError(() => (error instanceof Error ? error : new Error(operation)));
    };
  }
}
