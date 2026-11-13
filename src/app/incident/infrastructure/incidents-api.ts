import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';
import { Incident } from '../domain/model/incident.entity';
import { Delay } from '../domain/model/delay.entity';
import { IncidentsApiEndpoint } from './incidents-api-endpoint';
import { DelaysApiEndpoint } from './delays-api-endpoint';

/**
 * Infrastructure facade for the Incident Management bounded context.
 */
@Injectable({ providedIn: 'root' })
export class IncidentsApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(DemoRoleSession);
  private readonly incidentsEndpoint = new IncidentsApiEndpoint(this.http);
  private readonly delaysEndpoint = new DelaysApiEndpoint(this.http);

  /**
   * Runs a request that needs the acting driver profile ID.
   * @param request - Request factory that receives the driver profile ID.
   * @returns Stream of the request, or an error stream with an i18n key.
   */
  private asDriver<T>(request: (driverProfileId: number) => Observable<T>): Observable<T> {
    const driverProfileId = this.session.role() === 'driver' ? this.session.profileId() : null;
    return driverProfileId ? request(driverProfileId) : throwError(() => new Error('errors.driverProfileRequired'));
  }

  /**
   * Retrieves the incidents of a trip.
   * @param tripId - Trip identifier.
   * @returns Stream with the incident collection.
   */
  getIncidents = (tripId: number): Observable<Incident[]> => this.incidentsEndpoint.getByTrip(tripId);

  /**
   * Retrieves an incident by ID.
   * @param id - Incident identifier.
   * @returns Stream with the incident.
   */
  getIncident = (id: number): Observable<Incident> => this.incidentsEndpoint.getById(id);

  /**
   * Reports an incident on behalf of the acting driver.
   * @param incident - Incident to report.
   * @returns Stream with the created incident.
   */
  createIncident = (incident: Incident): Observable<Incident> =>
    this.asDriver(driverProfileId => this.incidentsEndpoint.report(incident, driverProfileId));

  /**
   * Updates an incident.
   * @param incident - Incident to update.
   * @returns Stream with the updated incident.
   */
  updateIncident = (incident: Incident): Observable<Incident> => this.incidentsEndpoint.update(incident, incident.id);

  /**
   * Retrieves the delays of a trip.
   * @param tripId - Trip identifier.
   * @returns Stream with the delay collection.
   */
  getDelays = (tripId: number): Observable<Delay[]> => this.delaysEndpoint.getByTrip(tripId);

  /**
   * Retrieves a delay by ID.
   * @param id - Delay identifier.
   * @returns Stream with the delay.
   */
  getDelay = (id: number): Observable<Delay> => this.delaysEndpoint.getById(id);

  /**
   * Reports a delay on behalf of the acting driver.
   * @param delay - Delay to report.
   * @returns Stream with the created delay.
   */
  createDelay = (delay: Delay): Observable<Delay> =>
    this.asDriver(driverProfileId => this.delaysEndpoint.report(delay, driverProfileId));

  /**
   * Reports an update of an existing delay on behalf of the acting driver.
   * @param delay - Delay with the new values and the ID being superseded.
   * @returns Stream with the new delay.
   */
  updateDelay = (delay: Delay): Observable<Delay> =>
    this.asDriver(driverProfileId => this.delaysEndpoint.reportUpdate(delay, delay.id, driverProfileId));
}
