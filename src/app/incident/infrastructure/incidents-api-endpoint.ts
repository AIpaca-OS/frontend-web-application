import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Incident } from '../domain/model/incident.entity';
import { IncidentResource, IncidentsResponse } from './incidents-response';
import { IncidentAssembler } from './incident-assembler';
import { environment } from '../../../environments/environment';

/**
 * Endpoint client for the Incidents resource.
 *
 * @remarks
 * Supported operations (Swagger): GET /incidents?tripId, GET/PUT /incidents/{id}, POST /incidents,
 * PATCH /incidents/{id}/resolve and POST /incidents/{id}/acknowledgements. There is no DELETE.
 */
export class IncidentsApiEndpoint extends BaseApiEndpoint<Incident, IncidentResource, IncidentsResponse, IncidentAssembler> {
  /**
   * Creates an instance of IncidentsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderIncidentsEndpointPath}`, new IncidentAssembler());
  }

  /**
   * Fetches the incidents of a trip.
   * @param tripId - Trip identifier.
   * @returns Stream with the mapped incidents.
   */
  getByTrip(tripId: number): Observable<Incident[]> {
    return this.http.get<IncidentResource[]>(this.endpointUrl, { params: { tripId } }).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to fetch incidents'))
    );
  }

  /**
   * Reports an incident.
   * @param incident - Incident to report.
   * @param reportedByProfileId - Reporting driver profile.
   * @returns Stream with the created incident.
   */
  report(incident: Incident, reportedByProfileId: number): Observable<Incident> {
    return this.http.post<IncidentResource>(this.endpointUrl, this.assembler.toReportResourceFromEntity(incident, reportedByProfileId)).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to report incident'))
    );
  }

  /**
   * Updates the category and description of an incident (UpdateIncidentRequest).
   * @param incident - Incident state to persist.
   * @param id - Incident identifier.
   * @returns Stream with the updated incident.
   */
  override update(incident: Incident, id: number): Observable<Incident> {
    return this.http.put<IncidentResource>(`${this.endpointUrl}/${id}`, { category: incident.title, description: incident.message }).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to update incident'))
    );
  }
}
