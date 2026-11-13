import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { DataDeletionRequest } from '../domain/model/data-deletion-request.entity';
import { DataDeletionRequestAssembler } from './data-deletion-request-assembler';
import { DataDeletionRequestResource, DataDeletionRequestsResponse } from './data-deletion-requests-response';
import { environment } from '../../../environments/environment';

/**
 * Endpoint client for the Data Deletion Requests resource.
 *
 * @remarks
 * Supported operations (Swagger): POST /data-deletion-requests, GET /{id},
 * GET /by-requester/{profileId} and POST /{id}/approve|reject.
 */
export class DataDeletionRequestsApiEndpoint extends BaseApiEndpoint<DataDeletionRequest, DataDeletionRequestResource, DataDeletionRequestsResponse, DataDeletionRequestAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderDataDeletionRequestsEndpointPath}`, new DataDeletionRequestAssembler());
  }

  getByRequester(profileId: number): Observable<DataDeletionRequest[]> {
    return this.http.get<DataDeletionRequestResource[]>(`${this.endpointUrl}/by-requester/${profileId}`).pipe(
      map(rows => rows.map(row => this.assembler.toEntityFromResource(row))),
      catchError(this.handleError('Failed to load data-deletion requests')),
    );
  }

  override create(entity: DataDeletionRequest): Observable<DataDeletionRequest> {
    return this.http.post<DataDeletionRequestResource>(this.endpointUrl, {
      studentId: entity.studentId, requestedByProfileId: entity.requestedByTutorId,
    }).pipe(map(row => this.assembler.toEntityFromResource(row)),
      catchError(this.handleError('Failed to request data deletion')));
  }

  resolve(id: number, decision: 'approve' | 'reject', resolutionNote: string): Observable<DataDeletionRequest> {
    return this.http.post<DataDeletionRequestResource>(`${this.endpointUrl}/${id}/${decision}`, {
      resolutionNote,
    }).pipe(map(row => this.assembler.toEntityFromResource(row)),
      catchError(this.handleError('Failed to resolve data-deletion request')));
  }
}
