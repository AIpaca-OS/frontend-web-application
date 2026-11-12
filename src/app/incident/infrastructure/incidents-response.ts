import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface IncidentsResponse extends BaseResponse {
  incidents: IncidentResource[];
}

export interface IncidentResource extends BaseResource {
  id: number;
  title: string;
  message: string;
  priority: string;
  studentIds: number[];
  resolved: boolean;
  resolvedAt: string;
  createdAt: string;
}
