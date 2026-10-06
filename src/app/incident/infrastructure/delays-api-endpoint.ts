import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Delay } from '../domain/model/delay.entity';
import { DelayResource, DelaysResponse } from './delays-response';
import { DelayAssembler } from './delay-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export class DelaysApiEndpoint extends BaseApiEndpoint<Delay, DelayResource, DelaysResponse, DelayAssembler> {

  constructor(http: HttpClient) {
    super(
      http, `${environment.platformProviderDelaysEndpointPath}${environment.platformProviderDelaysEndpointPath}`, new DelayAssembler(),
    );
  }

}
