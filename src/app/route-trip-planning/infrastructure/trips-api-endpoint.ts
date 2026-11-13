import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Trip } from '../domain/model/trip.entity';
import { PlanTripResource, TripResource, TripsResponse } from './trips-response';
import { TripAssembler } from './trip-assembler';
import { environment } from '../../../environments/environment';

/**
 * Endpoint client for the Trips resource.
 *
 * @remarks
 * Supported operations (Swagger): GET /trips?routeId|driverProfileId, GET /trips/{id}, POST /trips,
 * PATCH /trips/{id}/start|complete|cancel, PATCH /trips/{id}/stops/{stopId}/served,
 * PATCH /trips/{id}/passengers/{studentId}/arrived and POST /trips/{id}/absences.
 */
export class TripsApiEndpoint extends BaseApiEndpoint<Trip, TripResource, TripsResponse, TripAssembler> {
  /**
   * Creates an instance of TripsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderTripsEndpointPath}`, new TripAssembler());
  }

  /**
   * Fetches the trips of a route.
   * @param routeId - Route identifier.
   * @returns Stream with the mapped trips.
   */
  getByRoute(routeId: number): Observable<Trip[]> {
    return this.http.get<TripResource[]>(this.endpointUrl, { params: { routeId } }).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to fetch trips'))
    );
  }

  /**
   * Plans a trip.
   * @param request - PlanTripRequest body.
   * @returns Stream with the planned trip.
   */
  plan(request: PlanTripResource): Observable<Trip> {
    return this.http.post<TripResource>(this.endpointUrl, request).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to plan trip'))
    );
  }

  /**
   * Starts or completes a trip.
   * @param id - Trip identifier.
   * @param action - Lifecycle action.
   * @returns Stream with the updated trip.
   */
  changeStatus(id: number, action: 'start' | 'complete'): Observable<Trip> {
    return this.http.patch<TripResource>(`${this.endpointUrl}/${id}/${action}`, {}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to ${action} trip`))
    );
  }

  /**
   * Marks a stop of a trip as served.
   * @param id - Trip identifier.
   * @param stopId - Stop identifier.
   * @returns Stream with the updated trip.
   */
  serveStop(id: number, stopId: number): Observable<Trip> {
    return this.http.patch<TripResource>(`${this.endpointUrl}/${id}/stops/${stopId}/served`, {}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to serve stop'))
    );
  }

  /**
   * Confirms the arrival of a passenger.
   * @param id - Trip identifier.
   * @param studentId - Student identifier.
   * @returns Stream with the updated trip.
   */
  confirmArrival(id: number, studentId: number): Observable<Trip> {
    return this.http.patch<TripResource>(`${this.endpointUrl}/${id}/passengers/${studentId}/arrived`, {}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to confirm arrival'))
    );
  }
}
