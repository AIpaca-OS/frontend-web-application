import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Route } from '../domain/model/route.entity';
import { RouteAssembler } from './route-assembler';
import { RouteResource, RoutesResponse } from './routes-response';
import { environment } from '../../../environments/environment';

export class RoutesApiEndpoint extends BaseApiEndpoint<
  Route,
  RouteResource,
  RoutesResponse,
  RouteAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.routePlanningApiBaseUrl}${environment.routePlanningRoutesEndpointPath}`,
      new RouteAssembler(),
    );
  }
}
