import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { TutorStudentRelationship } from '../domain/model/tutor-student-relationship.entity';
import { TutorStudentRelationshipAssembler } from './tutor-student-relationship-assembler';
import {
  TutorStudentRelationshipResource,
  TutorStudentRelationshipsResponse,
} from './tutor-student-relationships-response';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Provides HTTP access to tutor-student relationship operations within
 * the Profiles & Relationship Management bounded context.
 *
 * @remarks
 * This endpoint manages the relationships and authorizations established
 * between tutors and students.
 *
 * It extends {@link BaseApiEndpoint} to reuse the common CRUD operations
 * defined for API resources.
 *
 * Data received from the REST API is transformed into
 * {@link TutorStudentRelationship} domain entities through
 * {@link TutorStudentRelationshipAssembler}.
 */
export class TutorStudentRelationshipsApiEndpoint extends BaseApiEndpoint<
  TutorStudentRelationship,
  TutorStudentRelationshipResource,
  TutorStudentRelationshipsResponse,
  TutorStudentRelationshipAssembler
> {
  /**
   * Creates a new TutorStudentRelationshipsApiEndpoint instance.
   *
   * @param http - Angular HTTP client used to perform requests
   * against the tutor-student relationships REST resource.
   */
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.relationshipsApiBaseUrl}${environment.relationshipsTutorStudentsRelationshipsEndpointPath}`,
      new TutorStudentRelationshipAssembler(),
    );
  }
}
