import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface PlanResource extends BaseResource {
  id: number;
  name: string;
  referencePrice: number;
  active: boolean;
}

export interface PlansResponse extends BaseResponse {
  plans: PlanResource[];
}
