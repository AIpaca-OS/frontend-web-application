import {
  BaseResource,
  BaseResponse
} from '../../shared/infrastructure/base-response';

/**
 * Represents a tutor-student relationship resource exchanged with the API.
 *
 * @remarks
 * This interface defines the structure used by the infrastructure layer
 * to represent the relationship between a tutor and a student.
 *
 * Relationship and authorization values are received as strings from
 * the REST API and are later converted into their corresponding
 * domain enums by the assembler.
 */
export interface TutorStudentRelationshipResource extends BaseResource {
  /**
   * Unique identifier of the tutor-student relationship.
   */
  id: number;

  /**
   * Identifier of the tutor associated with the relationship.
   */
  tutorId: number;

  /**
   * Identifier of the student associated with the relationship.
   */
  studentId: number;

  /**
   * Type of relationship between the tutor and the student.
   *
   * @remarks
   * This value is converted into a domain RelationshipType
   * by the assembler.
   */
  relationshipType: string;

  /**
   * Current authorization status of the relationship.
   *
   * @remarks
   * This value is converted into a domain AuthorizationStatus
   * by the assembler.
   */
  authorizationStatus: string;

  /**
   * Date and time when the tutor was authorized.
   *
   * @remarks
   * The value is expected to use ISO 8601 format.
   */
  authorizedAt: string;

  /**
   * Date and time when the authorization was revoked.
   *
   * @remarks
   * The value is `null` while the authorization remains active.
   */
  revokedAt: string | null;
}

/**
 * Represents the response returned by the
 * tutor-student relationships collection endpoint.
 */
export interface TutorStudentRelationshipsResponse extends BaseResponse {
  /**
   * Collection of tutor-student relationship resources
   * contained in the response.
   */
  relationships: TutorStudentRelationshipResource[];
}
