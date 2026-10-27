import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { RouteShift } from '../domain/model/route.entity';
import { RouteSchedule } from '../domain/model/route-schedule.entity';
import { RouteStop } from '../domain/model/route-stop.entity';

/** Contrato provisional de MockAPI; algunos registros antiguos carecen de campos. */
export interface RouteResource extends BaseResource {
  id: number | string;
  name: string;
  code?: string;
  departureTime?: string;
  status?: string;
  stopsCount?: number;
  shift?: RouteShift;
  stops?: RouteStop[];
  schedule?: RouteSchedule[];
  scheduleConfirmed?: boolean;
}

export interface RoutesResponse extends BaseResponse {
  routes: RouteResource[];
}
