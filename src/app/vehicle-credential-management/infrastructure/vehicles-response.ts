import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface VehicleResource extends BaseResource {
  id: number;
  brand: string;
  model: string;
  licensePlate: string;
  capacity: number;
  year: number;
  status: string;
}

export interface VehiclesResponse extends BaseResponse {
  vehicles: VehicleResource[];
}
