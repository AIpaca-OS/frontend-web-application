import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { RoutesApiEndpoint } from './routes-api-endpoint';
import { Route } from '../domain/model/route.entity';

@Injectable({
  providedIn: 'root',
})
export class RoutesApi extends BaseApi {
  private readonly endpoint: RoutesApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.endpoint = new RoutesApiEndpoint(http);
  }

  getRoutes(): Observable<Route[]> {
    return this.endpoint.getAll();
  }

  getRouteById(id: number): Observable<Route> {
    return this.endpoint.getById(id);
  }

  createRoute(route: Route): Observable<Route> {
    return this.endpoint.create(route);
  }

  updateRoute(route: Route): Observable<Route> {
    return this.endpoint.update(route, route.id);
  }

  deleteRoute(id: number): Observable<void> {
    return this.endpoint.delete(id);
  }
}
