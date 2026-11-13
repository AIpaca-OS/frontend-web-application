import { Route } from '../domain/model/route.entity';
import { RouteSchedule, isValidRouteSchedule } from '../domain/model/route-schedule.entity';
import { RouteResource, RoutesResponse } from './routes-response';

/**
 * Maps route entities to and from API resources.
 *
 * @remarks
 * The UI entity keeps string identifiers (form controls), while Spring Boot uses Long IDs.
 */
export class RouteAssembler {
  /**
   * Converts a RoutesResponse to an array of Route entities.
   * @param response - The API response containing routes.
   * @returns An array of Route entities.
   */
  toEntitiesFromResponse = (response: RoutesResponse): Route[] =>
    response.routes.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a RouteResource to a Route entity.
   * @param resource - The resource to convert.
   * @returns The converted Route entity.
   */
  toEntityFromResource = (resource: RouteResource): Route => {
    const stops = (resource.stops ?? []).map(stop => ({
      id: String(stop.id),
      address: stop.address,
      position: stop.position,
      studentIds: (stop.studentIds ?? []).map(String),
      studentId: stop.studentIds?.length ? String(stop.studentIds[0]) : null,
      studentName: null,
    }));
    const schedule: RouteSchedule[] = (resource.schedule ?? []).map(row => ({ ...row }));
    return new Route({
      id: String(resource.id),
      name: resource.name,
      code: resource.code,
      departureTime: resource.departureTime ?? '',
      status: resource.status,
      driverProfileId: resource.driverProfileId,
      vehicleId: resource.vehicleId == null ? null : String(resource.vehicleId),
      stopsCount: resource.stopsCount ?? stops.length,
      shift: resource.shift,
      stops,
      schedule,
      scheduleConfirmed: Boolean(resource.scheduleConfirmed) && isValidRouteSchedule(schedule),
    });
  };

  /**
   * Converts a Route entity to a RouteResource.
   * @param entity - The entity to convert.
   * @returns The converted RouteResource.
   */
  toResourceFromEntity = (entity: Route): RouteResource => ({
    id: Number(entity.id),
    driverProfileId: entity.driverProfileId ?? 0,
    name: entity.name,
    code: entity.code,
    departureTime: entity.departureTime,
    status: entity.status,
    shift: entity.shift,
    vehicleId: entity.vehicleId ? Number(entity.vehicleId) : null,
    stopsCount: entity.stopsCount,
    stops: entity.stops.map(stop => ({
      id: Number(stop.id),
      address: stop.address,
      position: stop.position,
      studentIds: (stop.studentIds ?? (stop.studentId ? [stop.studentId] : [])).map(Number),
    })),
    schedule: entity.schedule,
    scheduleConfirmed: entity.scheduleConfirmed,
  });

  /**
   * Builds the body of POST /routes (CreateRouteRequest).
   * @param entity - Route to create.
   * @param driverProfileId - Owner driver profile.
   * @returns Request body.
   */
  toCreateResourceFromEntity = (entity: Route, driverProfileId: number) => ({
    driverProfileId,
    name: entity.name,
    shift: entity.shift,
    vehicleId: entity.vehicleId ? Number(entity.vehicleId) : null,
    stops: entity.stops.map(stop => ({ address: stop.address })),
    schedule: entity.schedule,
    scheduleConfirmed: entity.scheduleConfirmed,
  });

  /**
   * Builds the body of PUT /routes/{id} (UpdateRouteRequest).
   * @param entity - Route to update.
   * @returns Request body.
   */
  toUpdateResourceFromEntity = (entity: Route) => ({
    name: entity.name,
    shift: entity.shift,
    vehicleId: entity.vehicleId ? Number(entity.vehicleId) : null,
    stops: entity.stops.map(stop => ({ ...(stop.id ? { id: Number(stop.id) } : {}), address: stop.address })),
    schedule: entity.schedule,
    scheduleConfirmed: entity.scheduleConfirmed,
  });
}
