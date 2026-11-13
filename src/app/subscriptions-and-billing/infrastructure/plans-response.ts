import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Resource returned by the Plans endpoints (PlanResource in Swagger).
 */
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

/**
 * Response envelope for plan collection queries.
 */
export interface PlansResponse extends BaseResponse {
  plans: PlanResource[];
}
