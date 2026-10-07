import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Vehicle } from '../domain/model/vehicle.entity';
import { VehicleResource, VehiclesResponse } from './vehicles-response';
import { VehicleAssembler } from './vehicle-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export class VehiclesApiEndpoint extends BaseApiEndpoint<
  Vehicle,
  VehicleResource,
  VehiclesResponse,
  VehicleAssembler
> {
  constructor(http: HttpClient) {
    const baseUrl = (environment as any).platformProviderApiBaseUrl || '/api/v1';
    super(http, `${baseUrl}/vehicles`, new VehicleAssembler());
  }
}
