import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { ServiceEnrollment } from '../domain/model/service-enrollment.entity';
import { Student } from '../domain/model/student.entity';
import { ServiceEnrollmentAssembler } from './service-enrollment-assembler';
import { ServiceEnrollmentResource, ServiceEnrollmentsResponse } from './service-enrollments-response';
import { DriverStudentResource } from './students-response';
import { StudentAssembler } from './student-assembler';
import { environment } from '../../../environments/environment';

/**
 * Endpoint client for the Service Enrollments resource.
 *
 * @remarks
 * Supported operations (Swagger): POST /service-enrollments, GET /{id}, GET /students/{studentId},
 * GET /drivers/{driverProfileId}, GET /drivers/{driverProfileId}/students and
 * POST /{id}/accept|cancel|end.
 */
export class ServiceEnrollmentsApiEndpoint extends BaseApiEndpoint<ServiceEnrollment, ServiceEnrollmentResource, ServiceEnrollmentsResponse, ServiceEnrollmentAssembler> {
  private readonly studentAssembler = new StudentAssembler();

  /**
   * Creates an instance of ServiceEnrollmentsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderServiceEnrollmentsEndpointPath}`, new ServiceEnrollmentAssembler());
  }

  /**
   * Fetches the enrollments of a student.
   * @param studentId - Student identifier.
   * @returns Stream with the mapped enrollments.
   */
  getByStudent(studentId: number): Observable<ServiceEnrollment[]> {
    return this.http.get<ServiceEnrollmentResource[]>(`${this.endpointUrl}/students/${studentId}`).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to fetch student enrollments'))
    );
  }

  /**
   * Fetches the enrollments addressed to a driver.
   * @param driverProfileId - Driver profile identifier.
   * @returns Stream with the mapped enrollments.
   */
  getByDriver(driverProfileId: number): Observable<ServiceEnrollment[]> {
    return this.http.get<ServiceEnrollmentResource[]>(`${this.endpointUrl}/drivers/${driverProfileId}`).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to fetch driver enrollments'))
    );
  }

  /**
   * Fetches the students with an enrollment addressed to a driver.
   * @param driverProfileId - Driver profile identifier.
   * @returns Stream with the mapped students.
   */
  getDriverStudents(driverProfileId: number): Observable<Student[]> {
    return this.http.get<DriverStudentResource[]>(`${this.endpointUrl}/drivers/${driverProfileId}/students`).pipe(
      map(resources => resources.map(resource => this.studentAssembler.toEntityFromDriverStudentResource(resource))),
      catchError(this.handleError('Failed to fetch driver students'))
    );
  }

  /**
   * Requests the transport service of a driver for a student (RequestEnrollmentRequest).
   * @param studentId - Student identifier.
   * @param driverProfileId - Driver profile identifier.
   * @param requestedByProfileId - Tutor profile that requests the service.
   * @returns Stream with the created enrollment.
   */
  request(studentId: number, driverProfileId: number, requestedByProfileId: number): Observable<ServiceEnrollment> {
    return this.http.post<ServiceEnrollmentResource>(this.endpointUrl, { studentId, driverProfileId, requestedByProfileId }).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to request service enrollment'))
    );
  }

  /**
   * Applies a lifecycle transition to an enrollment.
   * @param id - Enrollment identifier.
   * @param action - Transition to apply (accept requires the driver, cancel/end the requester).
   * @param profileId - Profile that performs the transition.
   * @returns Stream with the updated enrollment.
   */
  transition(id: number, action: 'accept' | 'cancel' | 'end', profileId: number): Observable<ServiceEnrollment> {
    const param = action === 'accept' ? 'driverProfileId' : 'requestedByProfileId';
    return this.http.post<ServiceEnrollmentResource>(`${this.endpointUrl}/${id}/${action}`, null, { params: { [param]: profileId } }).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError(`Failed to ${action} service enrollment`))
    );
  }
}
