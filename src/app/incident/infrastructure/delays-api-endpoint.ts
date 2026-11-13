import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Delay } from '../domain/model/delay.entity';
import { DelayResource, DelaysResponse } from './delays-response';
import { DelayAssembler } from './delay-assembler';
import { environment } from '../../../environments/environment';

/**
 * Endpoint client for the Delays resource.
 *
 * @remarks
 * Supported operations (Swagger): GET /delays?tripId, GET /delays/{id}, POST /delays and
 * POST /delays/{id}/updates (a new delay supersedes the previous one). There is no PUT or DELETE.
 */
export class DelaysApiEndpoint extends BaseApiEndpoint<Delay, DelayResource, DelaysResponse, DelayAssembler> {
  /**
   * Creates an instance of DelaysApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderDelaysEndpointPath}`, new DelayAssembler());
  }

  /**
   * Fetches the delays of a trip.
   * @param tripId - Trip identifier.
   * @returns Stream with the mapped delays.
   */
  getByTrip(tripId: number): Observable<Delay[]> {
    return this.http.get<DelayResource[]>(this.endpointUrl, { params: { tripId } }).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to fetch delays'))
    );
  }

  /**
   * Reports a delay.
   * @param delay - Delay to report.
   * @param reportedByProfileId - Reporting driver profile.
   * @returns Stream with the created delay.
   */
  report(delay: Delay, reportedByProfileId: number): Observable<Delay> {
    return this.http.post<DelayResource>(this.endpointUrl, this.assembler.toReportResourceFromEntity(delay, reportedByProfileId)).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to report delay'))
    );
  }

  /**
   * Reports an update of an existing delay (UpdateDelayRequest).
   * @param delay - New delay values.
   * @param id - Identifier of the delay being superseded.
   * @param reportedByProfileId - Reporting driver profile.
   * @returns Stream with the new delay.
   */
  reportUpdate(delay: Delay, id: number, reportedByProfileId: number): Observable<Delay> {
    const { tripId: _tripId, ...request } = this.assembler.toReportResourceFromEntity(delay, reportedByProfileId);
    return this.http.post<DelayResource>(`${this.endpointUrl}/${id}/updates`, request).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to update delay'))
    );
  }
}
