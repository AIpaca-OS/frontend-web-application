import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Route } from '../domain/model/route.entity';
import {
  ROUTE_WEEKDAYS, RouteSchedule, RouteWeekday, isValidRouteSchedule,
} from '../domain/model/route-schedule.entity';
import { RouteResource, RoutesResponse } from './routes-response';

export class RouteAssembler implements BaseAssembler<Route, RouteResource, RoutesResponse> {
  toEntitiesFromResponse(response: RoutesResponse): Route[] {
    const list = Array.isArray(response)
      ? (response as unknown as RouteResource[])
      : (response.routes ?? []);
    return list.map(resource => this.toEntityFromResource(resource));
  }

  toEntityFromResource(resource: RouteResource): Route {
    const stops = Array.isArray(resource.stops)
      ? resource.stops.map((stop, index) => ({
          id: String(stop.id ?? `legacy-stop-${index + 1}`),
          address: String(stop.address ?? ''),
          position: Number(stop.position ?? index + 1),
          studentId: stop.studentId == null ? null : String(stop.studentId),
          studentName: stop.studentName == null ? null : String(stop.studentName),
        }))
      : [];

    const schedule: RouteSchedule[] = Array.isArray(resource.schedule)
      ? resource.schedule
          .filter(row => row && ROUTE_WEEKDAYS.includes(row.dayOfWeek as RouteWeekday))
          .map(row => ({
            dayOfWeek: row.dayOfWeek,
            departureTime: String(row.departureTime ?? ''),
          }))
      : [];

    return new Route({
      id: Number(resource.id),
      name: String(resource.name ?? ''),
      code: String(resource.code ?? ''),
      departureTime: String(resource.departureTime ?? ''),
      status: String(resource.status ?? 'CONFIGURABLE'),
      stopsCount: Number(resource.stopsCount ?? stops.length),
      shift: resource.shift === 'AFTERNOON' ? 'AFTERNOON' : 'MORNING',
      stops,
      schedule,
      scheduleConfirmed: Boolean(resource.scheduleConfirmed) && isValidRouteSchedule(schedule),
    });
  }

  toResourceFromEntity(entity: Route): RouteResource {
    return {
      id: entity.id,
      name: entity.name,
      code: entity.code,
      departureTime: entity.departureTime,
      status: entity.status,
      stopsCount: entity.stops.length,
      shift: entity.shift,
      stops: entity.stops,
      schedule: entity.schedule,
      scheduleConfirmed: entity.scheduleConfirmed,
    };
  }
}
