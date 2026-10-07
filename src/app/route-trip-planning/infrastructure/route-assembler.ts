import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Route } from '../domain/model/route.entity';
import { RouteResource, RoutesResponse } from './routes-response';

export class RouteAssembler implements BaseAssembler<Route, RouteResource, RoutesResponse> {
  toEntitiesFromResponse = (response: RoutesResponse): Route[] => {
    const list =
      response.routes ||
      (Array.isArray(response) ? (response as unknown as RouteResource[]) : []);

    return list.map((resource) => this.toEntityFromResource(resource));
  };

  toEntityFromResource = (resource: RouteResource): Route =>
    new Route({
      id: Number(resource.id),
      name: resource.name,
      code: resource.code,
      departureTime: resource.departureTime,
      status: resource.status,
      stopsCount: Number(resource.stopsCount),
    });

  toResourceFromEntity = (entity: Route): RouteResource => ({
    id: entity.id,
    name: entity.name,
    code: entity.code,
    departureTime: entity.departureTime,
    status: entity.status,
    stopsCount: entity.stopsCount,
  });
}
