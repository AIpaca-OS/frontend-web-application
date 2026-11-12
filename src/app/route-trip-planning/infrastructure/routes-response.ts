import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { RouteShift } from '../domain/model/route.entity';
import { RouteSchedule } from '../domain/model/route-schedule.entity';
import { RouteStop } from '../domain/model/route-stop.entity';

/** Route resource accepted by the backend and legacy MockAPI records. */
export interface RouteResource extends BaseResource {
  id: string | number;
  vehicleId?: string | number | null;
  name: string;
  code?: string;
  departureTime?: string;
  status?: string;
  stopsCount?: number;
  shift?: RouteShift;
  stops?: (RouteStop & { studentIds?: number[] })[];
  schedule?: RouteSchedule[];
  scheduleConfirmed?: boolean;
}

export interface RoutesResponse extends BaseResponse {
  routes: RouteResource[];
}
