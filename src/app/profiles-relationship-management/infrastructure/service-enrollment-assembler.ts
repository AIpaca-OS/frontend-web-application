import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { ServiceEnrollment } from '../domain/model/service-enrollment.entity';
import { ServiceEnrollmentResource, ServiceEnrollmentsResponse } from './service-enrollments-response';

/**
 * Maps service-enrollment entities to and from API resources.
 */
export class ServiceEnrollmentAssembler implements BaseAssembler<ServiceEnrollment, ServiceEnrollmentResource, ServiceEnrollmentsResponse> {
  /**
   * Converts a ServiceEnrollmentsResponse to an array of ServiceEnrollment entities.
   * @param response - The API response containing enrollments.
   * @returns An array of ServiceEnrollment entities.
   */
  toEntitiesFromResponse = (response: ServiceEnrollmentsResponse): ServiceEnrollment[] =>
    response.enrollments.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a ServiceEnrollmentResource to a ServiceEnrollment entity.
   * @param resource - The resource to convert.
   * @returns The converted ServiceEnrollment entity.
   */
  toEntityFromResource = (resource: ServiceEnrollmentResource): ServiceEnrollment =>
    new ServiceEnrollment(resource.id, resource.studentId, resource.driverProfileId, resource.requestedByProfileId,
      resource.status, resource.requestedAt, resource.acceptedAt ?? null, resource.cancelledAt ?? null,
      resource.endedAt ?? null);

  /**
   * Converts a ServiceEnrollment entity to a ServiceEnrollmentResource.
   * @param entity - The entity to convert.
   * @returns The converted ServiceEnrollmentResource.
   */
  toResourceFromEntity = (entity: ServiceEnrollment): ServiceEnrollmentResource => ({
    id: entity.id,
    studentId: entity.studentId,
    driverProfileId: entity.driverProfileId,
    requestedByProfileId: entity.requestedByProfileId,
    status: entity.status,
    requestedAt: entity.requestedAt,
    acceptedAt: entity.acceptedAt,
    cancelledAt: entity.cancelledAt,
    endedAt: entity.endedAt,
  });
}
