import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Route } from '../domain/model/route.entity';
import { RouteSchedule } from '../domain/model/route-schedule.entity';
import { RouteAssembler } from './route-assembler';
import { RouteResource, RoutesResponse } from './routes-response';
import { environment } from '../../../environments/environment';

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
  ) {}

  getAll(): Observable<Route[]> {
    return this.http.get<RoutesResponse | RouteResource[]>(this.endpointUrl, this.requestOptions()).pipe(
      map(response => {
        const resources = Array.isArray(response) ? response : response.routes ?? [];
        return resources.map(resource => this.assembler.toEntityFromResource(resource));
      }),
      catchError(this.handleError('Unable to load routes')),
    );
  }

  getById(id: string): Observable<Route> {
    return this.http.get<RouteResource>(
      this.endpointUrl + '/' + encodeURIComponent(id), this.requestOptions(),
    ).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Unable to load route')),
    );
  }

  create(entity: Route): Observable<Route> {
    const payload = this.backendMode ? this.toBackendPayload(entity) : this.toMockPayload(entity);
    return this.http.post<RouteResource>(this.endpointUrl, payload, this.requestOptions()).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Unable to create route')),
    );
  }

  update(entity: Route, id: string): Observable<Route> {
    const payload = this.backendMode ? this.toBackendPayload(entity) : this.assembler.toResourceFromEntity(entity);
    return this.http.put<RouteResource>(
      this.endpointUrl + '/' + encodeURIComponent(id), payload, this.requestOptions(),
    ).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Unable to update route')),
    );
  }

  updateSchedule(id: string, schedule: RouteSchedule[], confirm: boolean): Observable<Route> {
    return this.http.put<RouteResource>(
      this.endpointUrl + '/' + encodeURIComponent(id) + '/schedule',
      { schedule, confirm },
      this.requestOptions(),
    ).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Unable to update route schedule')),
    );
  }

  getEligibleStudents(): Observable<EligibleStudentResource[]> {
    return this.http.get<EligibleStudentResource[]>(
      this.endpointUrl + '/eligible-students', this.requestOptions(),
    ).pipe(catchError(this.handleError('Unable to load eligible students')));
  }

  replaceAssignments(id: string, assignments: AssignmentInputResource[]): Observable<Route> {
    return this.http.put<RouteResource>(
      this.endpointUrl + '/' + encodeURIComponent(id) + '/assignments',
      assignments, this.requestOptions(),
    ).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Unable to save route assignments')),
    );
  }

  getAssignments(id: string): Observable<RouteAssignmentResource[]> {
    return this.http.get<RouteAssignmentResource[]>(
      this.endpointUrl + '/' + encodeURIComponent(id) + '/assignments', this.requestOptions(),
    ).pipe(catchError(this.handleError('Unable to load route assignments')));
  }

  assignStudent(id: string, studentId: string, stopId: string): Observable<RouteAssignmentResource> {
    return this.http.post<RouteAssignmentResource>(
      this.endpointUrl + '/' + encodeURIComponent(id) + '/assignments',
      { studentId, stopId },
      this.requestOptions(),
    ).pipe(catchError(this.handleError('Unable to assign student')));
  }

  publish(id: string): Observable<Route> {
    return this.http.patch<RouteResource>(
      this.endpointUrl + '/' + encodeURIComponent(id) + '/status',
      { status: 'PUBLISHED' },
      this.requestOptions(),
    ).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Unable to publish route')),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      this.endpointUrl + '/' + encodeURIComponent(id), this.requestOptions(),
    ).pipe(catchError(this.handleError('Unable to delete route')));
  }

  private toBackendPayload(entity: Route): object {
    return {
      name: entity.name,
      shift: entity.shift,
      departureTime: entity.departureTime,
      vehicleId: entity.vehicleId,
      stops: entity.stops.map(stop => ({
        id: stop.id,
        address: stop.address,
        studentId: stop.studentId ?? null,
      })),
      schedule: entity.schedule,
      scheduleConfirmed: entity.scheduleConfirmed,
    };
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
    return { headers: new HttpHeaders({ 'Accept-Language': language }) };
  }

  private handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      const detail = error.error && typeof error.error.detail === 'string'
        ? error.error.detail
        : null;
      const message = detail ?? operation + ' (HTTP ' + (error.status || 'unknown') + ')';
      return throwError(() => new Error(message));
    };
  }
}
