import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { DataDeletionRequest } from '../domain/model/data-deletion-request.entity';
import { DataDeletionRequestAssembler } from './data-deletion-request-assembler';
import {
  DataDeletionRequestResource,
  DataDeletionRequestsResponse,
} from './data-deletion-requests-response';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Provides HTTP access to student data deletion request operations within
 * the Profiles & Relationship Management bounded context.
 *
 * @remarks
 * This endpoint manages requests submitted by tutors to delete
 * student personal data.
 *
 * It extends {@link BaseApiEndpoint} to reuse the common CRUD
 * operations defined for API resources.
 *
 * Data received from the REST API is transformed into
 * {@link DataDeletionRequest} domain entities through
 * {@link DataDeletionRequestAssembler}.
 */
export class DataDeletionRequestsApiEndpoint extends BaseApiEndpoint<
  DataDeletionRequest,
  DataDeletionRequestResource,
  DataDeletionRequestsResponse,
  DataDeletionRequestAssembler
> {
  /**
   * Creates a new DataDeletionRequestsApiEndpoint instance.
   *
   * @param http - Angular HTTP client used to perform requests
   * against the data deletion requests REST resource.
   */
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.relationshipsApiBaseUrl}${environment.relationshipsDataDeletionRequestsEndpointPath}`,
      new DataDeletionRequestAssembler(),
    );
  }
}
