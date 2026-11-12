import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Incident } from '../domain/model/incident.entity';
import { Delay } from '../domain/model/delay.entity';
import { IncidentsApiEndpoint } from './incidents-api-endpoint';
import { DelaysApiEndpoint } from './delays-api-endpoint';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class IncidentsApi extends BaseApi {

  private readonly incidentsEndpoint: IncidentsApiEndpoint;
  private readonly delaysEndpoint: DelaysApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.incidentsEndpoint = new IncidentsApiEndpoint(http);
    this.delaysEndpoint = new DelaysApiEndpoint(http);
  }

  getIncidents(): Observable<Incident[]> {
    return this.incidentsEndpoint.getAll();
  }

  getIncident(id: number): Observable<Incident> {
    return this.incidentsEndpoint.getById(id);
  }

  createIncident(incident: Incident): Observable<Incident>{
    return this.incidentsEndpoint.create(incident);
  }

  updateIncident(incident: Incident): Observable<Incident>{
    return this.incidentsEndpoint.update(incident, incident.id);
  }

  deleteIncident(id: number): Observable<void>{
    return this.incidentsEndpoint.delete(id);
  }

  getDelays(): Observable<Delay[]> {
    return this.delaysEndpoint.getAll();
  }

  getDelay(id: number): Observable<Delay> {
    return this.delaysEndpoint.getById(id);
  }

  createDelay(delay: Delay): Observable<Delay>{
    return this.delaysEndpoint.create(delay);
  }

  updateDelay(delay: Delay): Observable<Delay>{
    return this.delaysEndpoint.update(delay, delay.id);
  }

  deleteDelay(id: number): Observable<void>{
    return this.delaysEndpoint.delete(id);
  }

}
