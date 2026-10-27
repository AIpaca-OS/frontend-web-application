import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Route } from '../domain/model/route.entity';
import { RouteAssembler } from './route-assembler';
import { RouteResource, RoutesResponse } from './routes-response';
import { environment } from '../../../environments/environment';

export class RoutesApiEndpoint extends BaseApiEndpoint<
  Route, RouteResource, RoutesResponse, RouteAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.routePlanningApiBaseUrl}${environment.routePlanningRoutesEndpointPath}`,
      new RouteAssembler(),
    );
  }

  // Do not send id: 0 during creation: MockAPI / backend should assign the route ID.
  override create(entity: Route): Observable<Route> {
    const resource = this.assembler.toResourceFromEntity(entity);
    const payload = {
      name: resource.name,
      code: resource.code,
      departureTime: resource.departureTime,
      status: resource.status,
      stopsCount: resource.stopsCount,
      shift: resource.shift,
      stops: resource.stops,
    };
    return this.http.post<RouteResource>(this.endpointUrl, payload).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create route')),
    );
  }
}
