import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Tutor acknowledgement of an incident (IncidentAcknowledgementResponse in Swagger).
 */
export interface IncidentAcknowledgementResource {
  id: number;
  tutorProfileId: number;
  acknowledgedAt: string;
}

/**
 * Resource returned by the Incidents endpoints (IncidentResponse in Swagger).
 */
export interface IncidentResource extends BaseResource {
  id: number;
  tripId: number;
  reportedByProfileId: number;
  studentId: number | null;
  category: 'MECHANICAL_FAILURE' | 'TRAFFIC_ACCIDENT' | 'ROAD_BLOCKED' | 'STUDENT_HEALTH' | 'OTHER' | string;
  description: string;
  status: 'OPEN' | 'RESOLVED' | string;
  resolution: string | null;
  reportedAt: string;
  resolvedAt: string | null;
  acknowledgements: IncidentAcknowledgementResource[];
}

/**
 * Body accepted by POST /incidents (ReportIncidentRequest in Swagger).
 */
export interface ReportIncidentResource {
  tripId: number;
  reportedByProfileId: number;
  studentId: number | null;
  category: string;
  description: string;
}

/**
 * Response envelope for incident collection queries.
 */
export interface IncidentsResponse extends BaseResponse {
  incidents: IncidentResource[];
}
