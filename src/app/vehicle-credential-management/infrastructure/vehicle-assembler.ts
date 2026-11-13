import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Vehicle } from '../domain/model/vehicle.entity';
import { CreateVehicleResource, UpdateVehicleResource, VehicleResource, VehiclesResponse } from './vehicles-response';

/**
 * Maps vehicle entities to and from API resources.
 */
export class VehicleAssembler implements BaseAssembler<Vehicle, VehicleResource, VehiclesResponse> {
  /**
   * Converts a VehiclesResponse to an array of Vehicle entities.
   * @param response - The API response containing vehicles.
   * @returns An array of Vehicle entities.
   */
  toEntitiesFromResponse = (response: VehiclesResponse): Vehicle[] =>
    response.vehicles.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a VehicleResource to a Vehicle entity.
   * @param resource - The resource to convert.
   * @returns The converted Vehicle entity.
   */
  toEntityFromResource = (resource: VehicleResource): Vehicle =>
    new Vehicle({
      id: resource.id,
      brand: resource.brand,
      model: resource.model,
      licensePlate: resource.licensePlate,
      capacity: resource.capacity,
      year: resource.year,
      status: resource.status,
    });

  /**
   * Converts a Vehicle entity to a VehicleResource.
   * @param entity - The entity to convert.
   * @returns The converted VehicleResource.
   */
  toResourceFromEntity = (entity: Vehicle): VehicleResource => ({
    id: entity.id,
    driverProfileId: 0,
    brand: entity.brand,
    model: entity.model,
    licensePlate: entity.licensePlate,
    capacity: entity.capacity,
    year: entity.year,
    status: entity.status,
  });

  /**
   * Builds the body of PUT /vehicles/{id}; status is managed by the backend.
   * @param entity - Vehicle to update.
   * @returns Request body.
   */
  toUpdateResourceFromEntity = (entity: Vehicle): UpdateVehicleResource => ({
    brand: entity.brand,
    model: entity.model,
    licensePlate: entity.licensePlate,
    capacity: entity.capacity,
    year: entity.year,
  });

  /**
   * Builds the body of POST /vehicles.
   * @param entity - Vehicle to register.
   * @param driverProfileId - Owner driver profile.
   * @returns Request body.
   */
  toCreateResourceFromEntity = (entity: Vehicle, driverProfileId: number): CreateVehicleResource => ({
    driverProfileId,
    ...this.toUpdateResourceFromEntity(entity),
  });
}
