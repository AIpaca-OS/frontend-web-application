import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { TutorStudentRelationship, RelationshipType, AuthorizationStatus } from '../domain/model/tutor-student-relationship.entity';
import { TutorStudentRelationshipResource, TutorStudentRelationshipsResponse } from './tutor-student-relationships-response';

export class TutorStudentRelationshipAssembler implements BaseAssembler<TutorStudentRelationship, TutorStudentRelationshipResource, TutorStudentRelationshipsResponse> {
  toEntitiesFromResponse = (response: TutorStudentRelationshipsResponse): TutorStudentRelationship[] =>
    response.relationships.map(row => this.toEntityFromResource(row));

  /** Student ID comes from the path; it is not part of the backend relationship resource. */
  toEntityForStudent = (resource: TutorStudentRelationshipResource, studentId: number): TutorStudentRelationship =>
    new TutorStudentRelationship({
      id: resource.id, studentId, tutorId: resource.tutorProfileId,
      relationshipType: resource.relationshipType as RelationshipType,
      authorizationStatus: resource.authorizationStatus as AuthorizationStatus,
      authorizedAt: resource.authorizedAt, revokedAt: resource.revokedAt,
    });

  toEntityFromResource = (resource: TutorStudentRelationshipResource): TutorStudentRelationship =>
    this.toEntityForStudent(resource, 0);

  toResourceFromEntity = (entity: TutorStudentRelationship): TutorStudentRelationshipResource => ({
    id: entity.id, tutorProfileId: entity.tutorId,
    authorizedByProfileId: 0, relationshipType: entity.relationshipType,
    authorizationStatus: entity.authorizationStatus,
    authorizedAt: entity.authorizedAt, revokedAt: entity.revokedAt,
  });
}
