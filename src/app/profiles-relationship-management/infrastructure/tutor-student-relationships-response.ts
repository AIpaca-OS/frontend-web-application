import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/** Resource returned by GET/POST /students/{studentId}/tutors. */
export interface TutorStudentRelationshipResource extends BaseResource {
  id: number;
  tutorProfileId: number;
  authorizedByProfileId: number;
  relationshipType: 'MOTHER' | 'FATHER' | 'LEGAL_GUARDIAN' | 'OTHER';
  authorizationStatus: 'AUTHORIZED' | 'REVOKED';
  authorizedAt: string;
  revokedAt: string | null;
}
export interface TutorStudentRelationshipsResponse extends BaseResponse {
  relationships: TutorStudentRelationshipResource[];
}
