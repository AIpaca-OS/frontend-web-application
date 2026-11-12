import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Vehicle } from '../domain/model/vehicle.entity';
import { VehicleResource, VehiclesResponse } from './vehicles-response';

export class VehicleAssembler implements BaseAssembler<Vehicle, VehicleResource, VehiclesResponse> {
  toEntitiesFromResponse = (response: VehiclesResponse): Vehicle[] => {
    const list =
      response.vehicles ||
      (Array.isArray(response) ? (response as unknown as VehicleResource[]) : []);
    return list.map((res) => this.toEntityFromResource(res));
  };

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

  toResourceFromEntity = (entity: Vehicle): VehicleResource => ({
    id: entity.id,
    brand: entity.brand,
    model: entity.model,
    licensePlate: entity.licensePlate,
    capacity: entity.capacity,
    year: entity.year,
    status: entity.status,
  });
}
