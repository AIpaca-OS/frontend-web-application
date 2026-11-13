import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Resource returned by the Subscriptions endpoints (SubscriptionResource in Swagger).
 */
export interface SubscriptionResource extends BaseResource {
  id: number;
  driverId: number;
  planId: number;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED' | string;
  startDate: string;
  endDate: string | null;
  active: boolean;
  vehicleLimit: number | null;
}

/**
 * Response envelope for subscription collection queries.
 */
export interface SubscriptionsResponse extends BaseResponse {
  subscriptions: SubscriptionResource[];
}
