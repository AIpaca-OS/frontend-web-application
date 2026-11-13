import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Resource returned by the Delays endpoints (DelayResponse in Swagger).
 */
export interface DelayResource extends BaseResource {
  id: number;
  tripId: number;
  reportedByProfileId: number;
  cause: string;
  estimatedMinutes: number;
  status: 'ACTIVE' | 'SUPERSEDED' | string;
  previousDelayId: number | null;
  reportedAt: string;
}

/**
 * Body accepted by POST /delays (ReportDelayRequest in Swagger).
 */
export interface ReportDelayResource {
  tripId: number;
  reportedByProfileId: number;
  cause: string;
  estimatedMinutes: number;
}

/**
 * Response envelope for delay collection queries.
 */
export interface DelaysResponse extends BaseResponse {
  delays: DelayResource[];
}
