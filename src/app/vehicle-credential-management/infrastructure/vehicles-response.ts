import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Resource returned by the Vehicles endpoints (VehicleResponse in Swagger).
 */
export interface VehicleResource extends BaseResource {
  id: number;
  driverProfileId: number;
  brand: string;
  model: string;
  licensePlate: string;
  capacity: number;
  year: number;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | string;
}

/**
 * Body accepted by PUT /vehicles/{id} (UpdateVehicleRequest in Swagger).
 */
export interface UpdateVehicleResource {
  brand: string;
  model: string;
  licensePlate: string;
  capacity: number;
  year: number;
}

/**
 * Body accepted by POST /vehicles (CreateVehicleRequest in Swagger).
 */
export interface CreateVehicleResource extends UpdateVehicleResource {
  driverProfileId: number;
}

/**
 * Response envelope for vehicle collection queries.
 */
export interface VehiclesResponse extends BaseResponse {
  vehicles: VehicleResource[];
}
