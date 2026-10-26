import { BaseAssembler } from '../../shared/infrastructure/base-assembler';

import {
  TutorStudentRelationshipResource,
  TutorStudentRelationshipsResponse,
} from './tutor-student-relationships-response';

import {
  AuthorizationStatus,
  RelationshipType,
  TutorStudentRelationship,
} from '../domain/model/tutor-student-relationship.entity';

/**
 * Maps TutorStudentRelationship entities to and from API resources.
 */
export class TutorStudentRelationshipAssembler implements BaseAssembler<
  TutorStudentRelationship,
  TutorStudentRelationshipResource,
  TutorStudentRelationshipsResponse
> {
  /**
   * Converts a TutorStudentRelationshipResponse into an array
   * of TutorStudentRelationship entities.
   *
   * @param response - The API response containing relationships.
   * @returns An array of TutorStudentRelationship entities.
   */
  toEntitiesFromResponse = (
    response: TutorStudentRelationshipsResponse,
  ): TutorStudentRelationship[] =>
    response.relationships.map((resource) => this.toEntityFromResource(resource));

  /**
   * Converts a TutorStudentRelationshipResource into a
   * TutorStudentRelationship entity.
   *
   * @param resource - The relationship resource to convert.
   * @returns The converted TutorStudentRelationship entity.
   */
  toEntityFromResource = (resource: TutorStudentRelationshipResource): TutorStudentRelationship =>
    new TutorStudentRelationship({
      id: resource.id,
      tutorId: resource.tutorId,
      studentId: resource.studentId,
      relationshipType: this.toRelationshipType(resource.relationshipType),
      authorizationStatus: this.toAuthorizationStatus(resource.authorizationStatus),
      authorizedAt: resource.authorizedAt,
      revokedAt: resource.revokedAt,
    });

  /**
   * Converts a TutorStudentRelationship entity into a
   * TutorStudentRelationshipResource.
   *
   * @param entity - The entity to convert.
   * @returns The converted TutorStudentRelationshipResource.
   */
  toResourceFromEntity = (entity: TutorStudentRelationship): TutorStudentRelationshipResource => ({
    id: entity.id,
    tutorId: entity.tutorId,
    studentId: entity.studentId,
    relationshipType: entity.relationshipType,
    authorizationStatus: entity.authorizationStatus,
    authorizedAt: entity.authorizedAt,
    revokedAt: entity.revokedAt,
  });

  /**
   * Converts an API relationship type into a valid RelationshipType.
   *
   * @param relationshipType - Relationship type received from the API.
   * @returns The corresponding RelationshipType.
   * @throws Error when the API returns an unsupported relationship type.
   */
  private toRelationshipType(relationshipType: string): RelationshipType {
    switch (relationshipType) {
      case RelationshipType.MOTHER:
        return RelationshipType.MOTHER;

      case RelationshipType.FATHER:
        return RelationshipType.FATHER;

      case RelationshipType.LEGAL_GUARDIAN:
        return RelationshipType.LEGAL_GUARDIAN;

      case RelationshipType.OTHER:
        return RelationshipType.OTHER;

      default:
        throw new Error(`Invalid relationship type: ${relationshipType}`);
    }
  }

  /**
   * Converts an API authorization status into a valid AuthorizationStatus.
   *
   * @param status - Authorization status received from the API.
   * @returns The corresponding AuthorizationStatus.
   * @throws Error when the API returns an unsupported authorization status.
   */
  private toAuthorizationStatus(status: string): AuthorizationStatus {
    switch (status) {
      case AuthorizationStatus.AUTHORIZED:
        return AuthorizationStatus.AUTHORIZED;

      case AuthorizationStatus.REVOKED:
        return AuthorizationStatus.REVOKED;

      default:
        throw new Error(`Invalid authorization status: ${status}`);
    }
  }
}
