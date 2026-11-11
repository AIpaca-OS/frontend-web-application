import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface SubscriptionResource extends BaseResource {
  id: number;
  driverId: number;
  planId: number;
  status: string;
  startDate: string;
  endDate: string;
  active: boolean;
  vehicleLimit: number | null;
}

export interface SubscriptionsResponse extends BaseResponse {
  subscriptions: SubscriptionResource[];
}
