import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Plan } from '../domain/model/plan.entity';
import { PlanResource, PlansResponse } from './plans-response';
import { PlanAssembler } from './plan-assembler';
import { environment } from '../../../environments/environment';

export class PlansApiEndpoint extends BaseApiEndpoint<
  Plan,
  PlanResource,
  PlansResponse,
  PlanAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.billingBasePath}${environment.billingPlansEndpointPath}`,
      new PlanAssembler(),
    );
  }
}
