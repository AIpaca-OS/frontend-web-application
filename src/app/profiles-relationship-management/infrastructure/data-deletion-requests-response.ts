import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface DataDeletionRequestResource extends BaseResource {
  id: number;
  studentId: number;
  requestedByProfileId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
}
export interface DataDeletionRequestsResponse extends BaseResponse {
  dataDeletionRequests: DataDeletionRequestResource[];
}
