import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface SubscriptionResource extends BaseResource {
  id: number;
  driverId: string;
  planId: string;
  status: string;
  startDate: string;
  paymentStatus: string;
  paymentAmount: number;
}

export interface SubscriptionsResponse extends BaseResponse {
  subscriptions: SubscriptionResource[];
}
