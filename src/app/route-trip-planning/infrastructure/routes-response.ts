import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { RouteShift } from '../domain/model/route.entity';
import { RouteStop } from '../domain/model/route-stop.entity';

/** El API actual es MockAPI; algunas rutas antiguas carecen de campos. */
export interface RouteResource extends BaseResource {
  id: number | string;
  name: string;
  code?: string;
  departureTime?: string;
  status?: string;
  stopsCount?: number;
  shift?: RouteShift;
  stops?: RouteStop[];
}

export interface RoutesResponse extends BaseResponse {
  routes: RouteResource[];
}
