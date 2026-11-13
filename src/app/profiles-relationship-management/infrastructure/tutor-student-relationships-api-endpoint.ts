import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, switchMap } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { TutorStudentRelationship } from '../domain/model/tutor-student-relationship.entity';
import { TutorStudentRelationshipAssembler } from './tutor-student-relationship-assembler';
import { TutorStudentRelationshipResource, TutorStudentRelationshipsResponse } from './tutor-student-relationships-response';
import { environment } from '../../../environments/environment';

/** Relationship endpoints belong to StudentsController, not a separate collection. */
export class TutorStudentRelationshipsApiEndpoint extends BaseApiEndpoint<TutorStudentRelationship, TutorStudentRelationshipResource, TutorStudentRelationshipsResponse, TutorStudentRelationshipAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderStudentsEndpointPath}`, new TutorStudentRelationshipAssembler());
  }

  getByStudent(studentId: number): Observable<TutorStudentRelationship[]> {
    return this.http.get<TutorStudentRelationshipResource[]>(`${this.endpointUrl}/${studentId}/tutors`).pipe(
      map(rows => rows.map(row => this.assembler.toEntityForStudent(row, studentId))),
      catchError(this.handleError('Failed to fetch tutor authorizations')),
    );
  }

  authorize(relation: TutorStudentRelationship, authorizedByProfileId: number): Observable<TutorStudentRelationship> {
    return this.http.post<TutorStudentRelationshipResource>(`${this.endpointUrl}/${relation.studentId}/tutors`, {
      tutorProfileId: relation.tutorId, authorizedByProfileId, relationshipType: relation.relationshipType,
    }).pipe(map(row => this.assembler.toEntityForStudent(row, relation.studentId)),
      catchError(this.handleError('Failed to authorize tutor')));
  }

  revoke(relation: TutorStudentRelationship, requestedByProfileId: number): Observable<TutorStudentRelationship> {
    const url = `${this.endpointUrl}/${relation.studentId}/tutors/${relation.tutorId}/revoke`;
    // The POST returns StudentResource, not TutorStudentRelationshipResource.
    // Reload the relationship history to recover the revoked child entity.
    return this.http.post<unknown>(url, null, {
      params: { requestedByProfileId },
    }).pipe(switchMap(() => this.getByStudent(relation.studentId)),
      map(rows => {
        const found = rows.find(row => row.id === relation.id);
        if (!found) throw new Error('errors.revokedAuthorizationMissing');
        return found;
      }),
      catchError(this.handleError('Failed to revoke tutor')));
  }
}
