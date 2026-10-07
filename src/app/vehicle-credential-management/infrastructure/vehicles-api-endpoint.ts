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
    super(
      http,
      'https://6ac59b2c54a61668c5f745e7.mockapi.io/api/v1/vehicles',
      new VehicleAssembler()
    );
  }
}
