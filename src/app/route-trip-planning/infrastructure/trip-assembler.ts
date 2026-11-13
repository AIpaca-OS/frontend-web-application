import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Trip } from '../domain/model/trip.entity';
import { TripResource, TripsResponse } from './trips-response';

/**
 * Maps trip entities to and from API resources.
 */
export class TripAssembler implements BaseAssembler<Trip, TripResource, TripsResponse> {
  /**
   * Converts a TripsResponse to an array of Trip entities.
   * @param response - The API response containing trips.
   * @returns An array of Trip entities.
   */
  toEntitiesFromResponse = (response: TripsResponse): Trip[] =>
    response.trips.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a TripResource to a Trip entity.
   * @param resource - The resource to convert.
   * @returns The converted Trip entity.
   */
  toEntityFromResource = (resource: TripResource): Trip =>
    new Trip(resource.id, resource.routeId, resource.driverProfileId, resource.vehicleId, resource.serviceDate,
      resource.shift, resource.status, (resource.students ?? []).map(passenger => ({
        studentId: String(passenger.studentId),
        stopId: String(passenger.stopId),
        stopPosition: passenger.stopPosition,
        stopAddress: passenger.stopAddress,
        absent: passenger.absent,
        stopServed: passenger.stopServed,
        arrived: passenger.arrived,
      })));

  /**
   * Converts a Trip entity to a TripResource.
   * @param entity - The entity to convert.
   * @returns The converted TripResource.
   */
  toResourceFromEntity = (entity: Trip): TripResource => ({
    id: entity.id,
    routeId: entity.routeId,
    driverProfileId: entity.driverProfileId,
    vehicleId: entity.vehicleId,
    serviceDate: entity.serviceDate,
    shift: entity.shift,
    status: entity.status,
    cancelReason: null,
    students: entity.students.map(passenger => ({
      ...passenger, studentId: Number(passenger.studentId), stopId: Number(passenger.stopId),
    })),
  });
}
