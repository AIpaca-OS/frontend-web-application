import { BaseAssembler } from '../../shared/infrastructure/base-assembler';

import {
  DataDeletionRequest,
  DeletionRequestStatus,
} from '../domain/model/data-deletion-request.entity';

import {
  DataDeletionRequestResource,
  DataDeletionRequestsResponse,
} from './data-deletion-requests-response';

/**
 * Maps DataDeletionRequest entities to and from API resources.
 */
export class DataDeletionRequestAssembler implements BaseAssembler<
  DataDeletionRequest,
  DataDeletionRequestResource,
  DataDeletionRequestsResponse
> {
  /**
   * Converts a DataDeletionRequestResponse into an array
   * of DataDeletionRequest entities.
   *
   * @param response - The API response containing deletion requests.
   * @returns An array of DataDeletionRequest entities.
   */
  toEntitiesFromResponse = (response: DataDeletionRequestsResponse): DataDeletionRequest[] =>
    response.dataDeletionRequests.map((resource) => this.toEntityFromResource(resource));

  /**
   * Converts a DataDeletionRequestResource into a
   * DataDeletionRequest entity.
   *
   * @param resource - The deletion request resource to convert.
   * @returns The converted DataDeletionRequest entity.
   */
  toEntityFromResource = (resource: DataDeletionRequestResource): DataDeletionRequest =>
    new DataDeletionRequest({
      id: resource.id,
      studentId: resource.studentId,
      requestedByTutorId: resource.requestedByTutorId,
      status: this.toDeletionRequestStatus(resource.status),
      requestedAt: resource.requestedAt,
      resolvedAt: resource.resolvedAt,
    });

  /**
   * Converts a DataDeletionRequest entity into a
   * DataDeletionRequestResource.
   *
   * @param entity - The entity to convert.
   * @returns The converted DataDeletionRequestResource.
   */
  toResourceFromEntity = (entity: DataDeletionRequest): DataDeletionRequestResource => ({
    id: entity.id,
    studentId: entity.studentId,
    requestedByTutorId: entity.requestedByTutorId,
    status: entity.status,
    requestedAt: entity.requestedAt,
    resolvedAt: entity.resolvedAt,
  });

  /**
   * Converts an API status into a valid DeletionRequestStatus.
   *
   * @param status - Status received from the API.
   * @returns The corresponding DeletionRequestStatus.
   * @throws Error when the API returns an unsupported status.
   */
  private toDeletionRequestStatus(status: string): DeletionRequestStatus {
    switch (status) {
      case DeletionRequestStatus.PENDING:
        return DeletionRequestStatus.PENDING;

      case DeletionRequestStatus.APPROVED:
        return DeletionRequestStatus.APPROVED;

      case DeletionRequestStatus.REJECTED:
        return DeletionRequestStatus.REJECTED;

      default:
        throw new Error(`Invalid deletion request status: ${status}`);
    }
  }
}
