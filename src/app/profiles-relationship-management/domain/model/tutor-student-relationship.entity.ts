import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Represents the relationship between a tutor and a student within the
 * Profiles & Relationship Management bounded context.
 *
 * @remarks
 * This entity defines which tutor is associated with a specific student,
 * the type of relationship between them, and the current authorization
 * status of that relationship.
 *
 * A relationship is considered authorized by default when it is created.
 */
export class TutorStudentRelationship implements BaseEntity {
  /**
   * Unique identifier of the tutor-student relationship.
   */
  readonly #id: number;

  /**
   * Identifier of the tutor associated with the student.
   */
  readonly #tutorId: number;

  /**
   * Identifier of the student associated with the tutor.
   */
  readonly #studentId: number;

  /**
   * Type of relationship between the tutor and the student.
   */
  readonly #relationshipType: RelationshipType;

  /**
   * Current authorization status of the relationship.
   */
  #authorizationStatus: AuthorizationStatus;

  /**
   * Date and time when the tutor was authorized for the student.
   *
   * @remarks
   * The value is stored as an ISO 8601 string.
   */
  readonly #authorizedAt: string;

  /**
   * Date and time when the tutor authorization was revoked.
   *
   * @remarks
   * The value is `null` while the relationship remains authorized.
   */
  #revokedAt: string | null;

  /**
   * Creates a new {@link TutorStudentRelationship} instance.
   *
   * @param props - Properties required to initialize the relationship.
   * @param props.id - Unique identifier of the relationship.
   * @param props.tutorId - Identifier of the associated tutor.
   * @param props.studentId - Identifier of the associated student.
   * @param props.relationshipType - Type of relationship between tutor and student.
   * @param props.authorizationStatus - Current authorization status.
   * If omitted, it defaults to {@link AuthorizationStatus.AUTHORIZED}.
   * @param props.authorizedAt - Date and time when the authorization was created.
   * If omitted, the current date and time are used.
   * @param props.revokedAt - Date and time when the authorization was revoked.
   * If omitted, it defaults to `null`.
   */
  constructor(props: {
    id: number;
    tutorId: number;
    studentId: number;
    relationshipType: RelationshipType;
    authorizationStatus?: AuthorizationStatus;
    authorizedAt?: string;
    revokedAt?: string | null;
  }) {
    this.#id = props.id;
    this.#tutorId = props.tutorId;
    this.#studentId = props.studentId;
    this.#relationshipType = props.relationshipType;
    this.#authorizationStatus = props.authorizationStatus ?? AuthorizationStatus.AUTHORIZED;
    this.#authorizedAt = props.authorizedAt ?? new Date().toISOString();
    this.#revokedAt = props.revokedAt ?? null;
  }

  /**
   * Gets the unique identifier of the relationship.
   * @returns The relationship identifier.
   */
  get id(): number {
    return this.#id;
  }

  /**
   * Gets the identifier of the associated tutor.
   * @returns The tutor identifier.
   */
  get tutorId(): number {
    return this.#tutorId;
  }

  /**
   * Gets the identifier of the associated student.
   * @returns The student identifier.
   */
  get studentId(): number {
    return this.#studentId;
  }

  /**
   * Gets the type of relationship between the tutor and the student.
   * @returns The current {@link RelationshipType}.
   */
  get relationshipType(): RelationshipType {
    return this.#relationshipType;
  }

  /**
   * Gets the current authorization status of the relationship.
   * @returns The current {@link AuthorizationStatus}.
   */
  get authorizationStatus(): AuthorizationStatus {
    return this.#authorizationStatus;
  }

  /**
   * Gets the date and time when the tutor was authorized.
   * @returns The authorization date as an ISO 8601 string.
   */
  get authorizedAt(): string {
    return this.#authorizedAt;
  }

  /**
   * Gets the date and time when the authorization was revoked.
   * @returns The revocation date as an ISO 8601 string,
   * or `null` if the relationship is still authorized.
   */
  get revokedAt(): string | null {
    return this.#revokedAt;
  }

  /**
   * Revokes the tutor's authorization for the student.
   *
   * @remarks
   * The authorization status is changed to
   * {@link AuthorizationStatus.REVOKED} and the current
   * date and time are stored as the revocation date.
   */
  revoke(): void {
    this.#authorizationStatus = AuthorizationStatus.REVOKED;
    this.#revokedAt = new Date().toISOString();
  }
}

/**
 * Represents the possible relationship types
 * between a tutor and a student.
 */
export enum RelationshipType {

  /**
   * The tutor is the student's mother.
   */
  MOTHER = 'MOTHER',

  /**
   * The tutor is the student's father.
   */
  FATHER = 'FATHER',

  /**
   * The tutor is the student's legal guardian.
   */
  LEGAL_GUARDIAN = 'LEGAL_GUARDIAN',

  /**
   * The tutor has another type of relationship with the student.
   */
  OTHER = 'OTHER',
}

/**
 * Represents the possible authorization states
 * of a tutor-student relationship.
 */
export enum AuthorizationStatus {

  /**
   * The tutor is currently authorized to access
   * the student's information.
   */
  AUTHORIZED = 'AUTHORIZED',

  /**
   * The tutor's authorization has been revoked.
   */
  REVOKED = 'REVOKED',
}
