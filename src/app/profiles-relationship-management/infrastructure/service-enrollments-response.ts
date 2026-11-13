import { BaseResponse, BaseResource } from '../../shared/infrastructure/base-response';
import { EnrollmentStatus } from '../domain/model/service-enrollment.entity';

/**
 * Resource returned by the Service Enrollments endpoints (ServiceEnrollmentResponse in Swagger).
 */
export interface ServiceEnrollmentResource extends BaseResource {
  id: number;
  studentId: number;
  driverProfileId: number;
  requestedByProfileId: number;
  status: EnrollmentStatus;
  requestedAt: string;
  acceptedAt: string | null;
  cancelledAt: string | null;
  endedAt: string | null;
}

/**
 * Response envelope for service-enrollment collection queries.
 */
export interface ServiceEnrollmentsResponse extends BaseResponse {
  enrollments: ServiceEnrollmentResource[];
}
