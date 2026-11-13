import { BaseResponse, BaseResource } from '../../shared/infrastructure/base-response';
import { RouteShift } from '../domain/model/route.entity';
import { RouteSchedule } from '../domain/model/route-schedule.entity';

/**
 * Stop of a route returned by the API (RouteStopResponse in Swagger).
 */
export interface RouteStopResource {
  id: number;
  address: string;
  position: number;
  studentIds: number[];
}

/**
 * Resource returned by the Routes endpoints (RouteResponse in Swagger).
 */
export interface RouteResource extends BaseResource {
  id: number;
  driverProfileId: number;
  name: string;
  code: string;
  departureTime: string;
  status: 'CONFIGURABLE' | 'PUBLISHED' | string;
  shift: RouteShift;
  vehicleId: number | null;
  stopsCount: number;
  stops: RouteStopResource[];
  schedule: RouteSchedule[];
  scheduleConfirmed: boolean;
}

/**
 * Student-to-stop assignment returned by GET/POST /routes/{id}/assignments (RouteAssignmentResponse).
 */
export interface RouteAssignmentResource extends BaseResource {
  id: number;
  stopId: number;
  studentId: number;
}

/**
 * Assignment accepted by PUT/POST /routes/{id}/assignments (AssignStudentRequest).
 */
export interface AssignStudentResource {
  studentId: number;
  stopId: number;
}

/**
 * Response envelope for route collection queries.
 */
export interface RoutesResponse extends BaseResponse {
  routes: RouteResource[];
}
