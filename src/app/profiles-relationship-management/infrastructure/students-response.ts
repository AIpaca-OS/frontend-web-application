import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Represents a student resource exchanged with the API.
 *
 * @remarks
 * This interface defines the structure used by the infrastructure layer
 * to represent student data received from or sent to the REST API.
 *
 * It extends {@link BaseResource}, which provides the numeric identifier
 * required by API resources.
 */
export interface StudentResource extends BaseResource {
  /**
   * Unique identifier of the student resource.
   */
  id: number;

  /**
   * Student's first name.
   */
  firstName: string;

  /**
   * Student's last name.
   */
  lastName: string;

  /**
   * Student's birthdate.
   *
   * @remarks
   * The value is expected to use the `YYYY-MM-DD` format.
   */
  birthDate: string;

  /**
   * Name of the school attended by the student.
   */
  schoolName: string;

  /**
   * Current status of the student.
   *
   * @remarks
   * The value is represented as a string because it is obtained
   * from the REST API and is later converted into a domain-specific
   * student status by the assembler.
   */
  status: string;
}

/**
 * Represents the response returned by the students collection endpoint.
 *
 * @remarks
 * This response groups the collection of student resources returned
 * by the API.
 */
export interface StudentsResponse extends BaseResponse {
  /**
   * Collection of student resources contained in the response.
   */
  students: StudentResource[];
}
