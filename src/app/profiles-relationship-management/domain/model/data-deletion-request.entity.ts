import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Represents a request to delete a student's personal data within the
 * Profiles & Relationship Management bounded context.
 *
 * @remarks
 * A deletion request is created by an authorized tutor for a specific student.
 * New requests are created with a {@link DeletionRequestStatus.PENDING}
 * status unless another status is explicitly provided.
 *
 * The request remains independent of the student deletion itself, allowing
 * the system to keep track of the request and its resolution.
 */
export class DataDeletionRequest implements BaseEntity {

  /**
   * Unique identifier of the deletion request.
   */
  readonly #id: number;

  /**
   * Identifier of the student whose data is requested to be deleted.
   */
  readonly #studentId: number;

  /**
   * Identifier of the tutor who created the deletion request.
   */
  readonly #requestedByTutorId: number;

  /**
   * Current status of the deletion request.
   */
  #status: DeletionRequestStatus;

  /**
   * Date and time when the deletion request was created.
   *
   * @remarks
   * The value is stored as an ISO 8601 string.
   */
  readonly #requestedAt: string;

  /**
   * Date and time when the deletion request was resolved.
   *
   * @remarks
   * The value remains `null` while the request is pending.
   */
  #resolvedAt: string | null;

  /**
   * Creates a new {@link DataDeletionRequest} instance.
   *
   * @param props - Properties required to initialize the deletion request.
   * @param props.id - Unique identifier of the request.
   * @param props.studentId - Identifier of the student whose data is requested
   * to be deleted.
   * @param props.requestedByTutorId - Identifier of the tutor who created
   * the request.
   * @param props.status - Current request status.
   * If omitted, it defaults to {@link DeletionRequestStatus.PENDING}.
   * @param props.requestedAt - Date and time when the request was created.
   * If omitted, the current date and time are used.
   * @param props.resolvedAt - Date and time when the request was resolved.
   * If omitted, it defaults to `null`.
   */
  constructor(props: {
    id: number;
    studentId: number;
    requestedByTutorId: number;
    status?: DeletionRequestStatus;
    requestedAt?: string;
    resolvedAt?: string | null;
  }) {
    this.#id = props.id;
    this.#studentId = props.studentId;
    this.#requestedByTutorId = props.requestedByTutorId;
    this.#status = props.status ?? DeletionRequestStatus.PENDING;
    this.#requestedAt = props.requestedAt ?? new Date().toISOString();
    this.#resolvedAt = props.resolvedAt ?? null;
  }

  /**
   * Gets the unique identifier of the deletion request.
   * @returns The request identifier.
   */
  get id(): number {
    return this.#id;
  }

  /**
   * Gets the identifier of the student associated with the request.
   * @returns The student identifier.
   */
  get studentId(): number {
    return this.#studentId;
  }

  /**
   * Gets the identifier of the tutor who created the request.
   * @returns The tutor identifier.
   */
  get requestedByTutorId(): number {
    return this.#requestedByTutorId;
  }

  /**
   * Gets the current status of the deletion request.
   * @returns The current {@link DeletionRequestStatus}.
   */
  get status(): DeletionRequestStatus {
    return this.#status;
  }

  /**
   * Gets the date and time when the request was created.
   * @returns The request creation date as an ISO 8601 string.
   */
  get requestedAt(): string {
    return this.#requestedAt;
  }

  /**
   * Gets the date and time when the request was resolved.
   * @returns The resolution date as an ISO 8601 string,
   * or `null` if the request is still pending.
   */
  get resolvedAt(): string | null {
    return this.#resolvedAt;
  }

  /**
   * Approves the deletion request.
   *
   * @remarks
   * The request status is changed to
   * {@link DeletionRequestStatus.APPROVED}
   * and the current date and time are stored as the resolution date.
   */
  approve(): void {
    this.#status = DeletionRequestStatus.APPROVED;
    this.#resolvedAt = new Date().toISOString();
  }

  /**
   * Rejects the deletion request.
   *
   * @remarks
   * The request status is changed to
   * {@link DeletionRequestStatus.REJECTED}
   * and the current date and time are stored as the resolution date.
   */
  reject(): void {
    this.#status = DeletionRequestStatus.REJECTED;
    this.#resolvedAt = new Date().toISOString();
  }
}

/**
 * Represents the possible states of a student data deletion request.
 */
export enum DeletionRequestStatus {

  /**
   * The request has been created but has not yet been resolved.
   */
  PENDING = 'PENDING',

  /**
   * The request has been approved.
   */
  APPROVED = 'APPROVED',

  /**
   * The request has been rejected.
   */
  REJECTED = 'REJECTED',
}
