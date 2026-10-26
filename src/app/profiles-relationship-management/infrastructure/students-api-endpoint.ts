import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Student } from '../domain/model/student.entity';
import { StudentResource, StudentsResponse } from './students-response';
import { StudentAssembler } from './student-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Provides HTTP access to student-related operations within the
 * Profiles & Relationship Management bounded context.
 *
 * @remarks
 * This endpoint extends {@link BaseApiEndpoint} to reuse the common
 * CRUD operations defined for API resources.
 *
 * Student data received from the REST API is transformed into
 * {@link Student} domain entities through {@link StudentAssembler}.
 *
 * The endpoint URL is built using the profiles API base URL and the
 * students resource path defined in the application environment.
 */
export class StudentsApiEndpoint extends BaseApiEndpoint<
  Student,
  StudentResource,
  StudentsResponse,
  StudentAssembler
> {
  /**
   * Creates a new {@link StudentsApiEndpoint} instance.
   *
   * @param http - Angular HTTP client used to perform requests
   * against the students REST resource.
   */
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.profilesApiBaseUrl}${environment.profilesStudentsEndpointPath}`,
      new StudentAssembler(),
    );
  }
}
