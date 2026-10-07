import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface RouteResource extends BaseResource {
  id: number;
  name: string;
  code: string;
  departureTime: string;
  status: string;
  stopsCount: number;
}

export interface RoutesResponse extends BaseResponse {
  routes: RouteResource[];
}
