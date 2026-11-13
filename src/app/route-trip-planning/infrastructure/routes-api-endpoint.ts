import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { ErrorHandlingEnabledBaseType } from '../../shared/infrastructure/error-handling-enabled-base-type';
import { Route } from '../domain/model/route.entity';
import { RouteSchedule } from '../domain/model/route-schedule.entity';
import { RouteAssembler } from './route-assembler';
import { AssignStudentResource, RouteAssignmentResource, RouteResource } from './routes-response';
import { environment } from '../../../environments/environment';

/**
 * Endpoint client for the Routes resource.
 *
 * @remarks
 * It cannot extend BaseApiEndpoint because the Route entity uses string identifiers.
 * Supported operations (Swagger): GET /routes?driverProfileId, GET/PUT/DELETE /routes/{id}, POST /routes,
 * PUT /routes/{id}/schedule, PATCH /routes/{id}/status, GET/PUT/POST /routes/{id}/assignments.
 * GET /routes/eligible-students answers 503, so candidates come from the driver's service enrollments.
 */
export class RoutesApiEndpoint extends ErrorHandlingEnabledBaseType {
  private readonly endpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderRoutesEndpointPath}`;
  private readonly assembler = new RouteAssembler();

  /**
   * Creates an instance of RoutesApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(private readonly http: HttpClient) {
    super();
  }

  /**
   * Fetches the routes of a driver.
   * @param driverProfileId - Driver profile identifier.
   * @returns Stream with the mapped routes.
   */
  getByDriver(driverProfileId: number): Observable<Route[]> {
    return this.http.get<RouteResource[]>(this.endpointUrl, { params: { driverProfileId } }).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to fetch routes'))
    );
  }

  /**
   * Fetches a route by identifier.
   * @param id - Route identifier.
   * @returns Stream with the mapped route.
   */
  getById(id: string): Observable<Route> {
    return this.http.get<RouteResource>(`${this.endpointUrl}/${encodeURIComponent(id)}`).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to fetch route'))
    );
  }

  /**
   * Creates a route for a driver.
   * @param entity - Route to create.
   * @param driverProfileId - Owner driver profile.
   * @returns Stream with the created route.
   */
  create(entity: Route, driverProfileId: number): Observable<Route> {
    return this.http.post<RouteResource>(this.endpointUrl, this.assembler.toCreateResourceFromEntity(entity, driverProfileId)).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to create route'))
    );
  }

  /**
   * Updates a route.
   * @param entity - Route state to persist.
   * @param id - Route identifier.
   * @returns Stream with the updated route.
   */
  update(entity: Route, id: string): Observable<Route> {
    return this.http.put<RouteResource>(`${this.endpointUrl}/${encodeURIComponent(id)}`, this.assembler.toUpdateResourceFromEntity(entity)).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to update route'))
    );
  }

  /**
   * Configures the weekly schedule of a route.
   * @param id - Route identifier.
   * @param schedule - Service days and departure times.
   * @param confirm - Whether the schedule is confirmed.
   * @returns Stream with the updated route.
   */
  updateSchedule(id: string, schedule: RouteSchedule[], confirm: boolean): Observable<Route> {
    return this.http.put<RouteResource>(`${this.endpointUrl}/${id}/schedule`, { schedule, confirm }).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to update route schedule'))
    );
  }

  /**
   * Fetches the student-to-stop assignments of a route.
   * @param id - Route identifier.
   * @returns Stream with the assignments.
   */
  getAssignments(id: string): Observable<RouteAssignmentResource[]> {
    return this.http.get<RouteAssignmentResource[]>(`${this.endpointUrl}/${id}/assignments`).pipe(
      catchError(this.handleError('Failed to fetch route assignments'))
    );
  }

  /**
   * Replaces every student-to-stop assignment of a route (the API answers with the updated route).
   * @param id - Route identifier.
   * @param assignments - New assignments.
   * @returns Stream with the updated route.
   */
  replaceAssignments(id: string, assignments: AssignStudentResource[]): Observable<Route> {
    return this.http.put<RouteResource>(`${this.endpointUrl}/${id}/assignments`, assignments).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to save route assignments'))
    );
  }

  /**
   * Publishes a route (PATCH /routes/{id}/status).
   * @param id - Route identifier.
   * @returns Stream with the published route.
   */
  publish(id: string): Observable<Route> {
    return this.http.patch<RouteResource>(`${this.endpointUrl}/${id}/status`, { status: 'PUBLISHED' }).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to publish route'))
    );
  }

  /**
   * Deletes a route.
   * @param id - Route identifier.
   * @returns Completion stream.
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${id}`).pipe(
      catchError(this.handleError('Failed to delete route'))
    );
  }
}
