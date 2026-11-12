import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Represents a student data deletion request resource exchanged
 * with the API.
 *
 * @remarks
 * This interface defines the infrastructure representation of
 * a request to delete a student's personal data.
 *
 * The request status is received as a string from the REST API
 * and is converted into the corresponding domain enum by the assembler.
 */
export interface DataDeletionRequestResource extends BaseResource {
  /**
   * Unique identifier of the deletion request.
   */
  id: number;

  /**
   * Identifier of the student whose data is requested
   * to be deleted.
   */
  studentId: number;

  /**
   * Identifier of the tutor who submitted the request.
   */
  requestedByTutorId: number;

  /**
   * Current status of the deletion request.
   *
   * @remarks
   * This value is converted into a domain DeletionRequestStatus
   * by the assembler.
   */
  status: string;

  /**
   * Date and time when the request was created.
   *
   * @remarks
   * The value is expected to use ISO 8601 format.
   */
  requestedAt: string;

  /**
   * Date and time when the request was resolved.
   *
   * @remarks
   * The value remains `null` while the request is pending.
   */
  resolvedAt: string | null;
}

/**
 * Represents the response returned by the
 * data deletion requests collection endpoint.
 */
export interface DataDeletionRequestsResponse extends BaseResponse {
  /**
   * Collection of data deletion request resources
   * contained in the response.
   */
  dataDeletionRequests: DataDeletionRequestResource[];
}
