import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface PlanResource extends BaseResource {
  id: number;
  name: string;
  description: string;
  referencePrice: number;
  currency: string;
  billingPeriodMonths: number | null;
  vehicleLimit: number | null;
  active: boolean;
}

export interface PlansResponse extends BaseResponse {
  plans: PlanResource[];
}
