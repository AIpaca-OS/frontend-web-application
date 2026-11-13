import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Student } from '../domain/model/student.entity';
import { RelationshipType } from '../domain/model/tutor-student-relationship.entity';
import { StudentAssembler } from './student-assembler';
import { StudentResource, StudentsResponse } from './students-response';
import { environment } from '../../../environments/environment';

/**
 * Endpoint client for the Students resource.
 *
 * @remarks
 * Supported operations (Swagger): GET /students?tutorProfileId, GET /students/{id},
 * POST /students and PUT /students/{id}. There is no DELETE: personal data is removed
 * through a data-deletion request.
 */
export class StudentsApiEndpoint extends BaseApiEndpoint<Student, StudentResource, StudentsResponse, StudentAssembler> {
  /**
   * Creates an instance of StudentsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderStudentsEndpointPath}`, new StudentAssembler());
  }

  /**
   * Fetches the students linked to a tutor.
   * @param tutorProfileId - Tutor profile identifier.
   * @returns Stream with the mapped students.
   */
  getByTutor(tutorProfileId: number): Observable<Student[]> {
    return this.http.get<StudentResource[]>(this.endpointUrl, { params: { tutorProfileId } }).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to fetch students'))
    );
  }

  /**
   * Registers a student and the relationship with the responsible tutor.
   * @param student - Student to register.
   * @param tutorProfileId - Responsible tutor profile identifier.
   * @param relationshipType - Relationship between tutor and student.
   * @returns Stream with the created student.
   */
  register(student: Student, tutorProfileId: number, relationshipType: RelationshipType): Observable<Student> {
    return this.http.post<StudentResource>(this.endpointUrl, {
      tutorProfileId,
      firstName: student.firstName,
      lastName: student.lastName,
      birthDate: student.birthDate,
      relationshipType
    }).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to register student'))
    );
  }

  /**
   * Updates the basic data of a student (UpdateStudentRequest).
   * @param student - Student state to persist.
   * @param id - Student identifier.
   * @returns Stream with the updated student.
   */
  override update(student: Student, id: number): Observable<Student> {
    return this.http.put<StudentResource>(`${this.endpointUrl}/${id}`, {
      firstName: student.firstName,
      lastName: student.lastName,
      birthDate: student.birthDate
    }).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to update student'))
    );
  }
}
