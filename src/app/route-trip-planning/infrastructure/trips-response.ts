import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Passenger of a trip (TripPassengerResponse in Swagger).
 */
export interface TripPassengerResource {
  studentId: number;
  stopId: number;
  stopPosition: number;
  stopAddress: string;
  absent: boolean;
  stopServed: boolean;
  arrived: boolean;
}

/**
 * Resource returned by the Trips endpoints (TripResponse in Swagger).
 */
export interface TripResource extends BaseResource {
  id: number;
  routeId: number;
  driverProfileId: number;
  vehicleId: number;
  serviceDate: string;
  shift: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'CANCELLED' | 'COMPLETED' | string;
  cancelReason: string | null;
  students: TripPassengerResource[];
}

/**
 * Body accepted by POST /trips (PlanTripRequest in Swagger).
 */
export interface PlanTripResource {
  routeId: number;
  driverProfileId: number;
  vehicleId: number;
  date: string;
  shift: string;
  passengers: Array<{ studentId: number; stopId: number; stopPosition: number; stopAddress: string }>;
}

/**
 * Response envelope for trip collection queries.
 */
export interface TripsResponse extends BaseResponse {
  trips: TripResource[];
}
