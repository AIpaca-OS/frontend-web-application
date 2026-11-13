import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { DataDeletionRequest, DeletionRequestStatus } from '../domain/model/data-deletion-request.entity';
import { DataDeletionRequestResource, DataDeletionRequestsResponse } from './data-deletion-requests-response';

export class DataDeletionRequestAssembler implements BaseAssembler<DataDeletionRequest, DataDeletionRequestResource, DataDeletionRequestsResponse> {
  toEntitiesFromResponse = (response: DataDeletionRequestsResponse): DataDeletionRequest[] =>
    response.dataDeletionRequests.map(row => this.toEntityFromResource(row));

  toEntityFromResource = (row: DataDeletionRequestResource): DataDeletionRequest =>
    new DataDeletionRequest({ id: row.id, studentId: row.studentId,
      requestedByTutorId: row.requestedByProfileId,
      status: row.status as DeletionRequestStatus,
      requestedAt: row.requestedAt, resolvedAt: row.resolvedAt,
    });

  toResourceFromEntity = (entity: DataDeletionRequest): DataDeletionRequestResource => ({
    id: entity.id, studentId: entity.studentId, requestedByProfileId: entity.requestedByTutorId,
    status: entity.status, requestedAt: entity.requestedAt,
    resolvedAt: entity.resolvedAt, resolutionNote: null,
  });
}
