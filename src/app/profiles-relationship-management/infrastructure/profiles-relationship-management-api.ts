import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';
import { Student } from '../domain/model/student.entity';
import { Tutor } from '../domain/model/tutor.entity';
import { Driver } from '../domain/model/driver.entity';
import { TutorStudentRelationship, RelationshipType } from '../domain/model/tutor-student-relationship.entity';
import { DataDeletionRequest } from '../domain/model/data-deletion-request.entity';
import { ServiceEnrollment } from '../domain/model/service-enrollment.entity';
import { StudentsApiEndpoint } from './students-api-endpoint';
import { ProfilesApiEndpoint } from './profiles-api-endpoint';
import { TutorStudentRelationshipsApiEndpoint } from './tutor-student-relationships-api-endpoint';
import { DataDeletionRequestsApiEndpoint } from './data-deletion-requests-api-endpoint';
import { ServiceEnrollmentsApiEndpoint } from './service-enrollments-api-endpoint';

/**
 * Infrastructure facade for the Profiles & Relationship Management bounded context.
 *
 * @remarks
 * Only operations published by the Rumbo API are exposed. The acting profile is the ID selected
 * at sign-in (preview session), which the API requires explicitly in several operations.
 */
@Injectable({ providedIn: 'root' })
export class ProfilesRelationshipApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(DemoRoleSession);
  private readonly studentsEndpoint = new StudentsApiEndpoint(this.http);
  private readonly profilesEndpoint = new ProfilesApiEndpoint(this.http);
  private readonly relationshipsEndpoint = new TutorStudentRelationshipsApiEndpoint(this.http);
  private readonly deletionRequestsEndpoint = new DataDeletionRequestsApiEndpoint(this.http);
  private readonly serviceEnrollmentsEndpoint = new ServiceEnrollmentsApiEndpoint(this.http);

  /**
   * Runs a request that needs the acting profile ID, failing as an observable when it is missing.
   * @param request - Request factory that receives the acting profile ID.
   * @returns Stream of the request, or an error stream with an i18n key.
   */
  private withActor<T>(request: (profileId: number) => Observable<T>): Observable<T> {
    const profileId = this.session.profileId();
    return profileId ? request(profileId) : throwError(() => new Error('errors.profileRequired'));
  }

  // Students

  /**
   * Retrieves the students linked to the acting tutor.
   * @returns Stream with the student collection.
   */
  getStudents = (): Observable<Student[]> =>
    this.withActor(profileId => this.studentsEndpoint.getByTutor(profileId));

  /**
   * Retrieves a single student by ID.
   * @param id - Student identifier.
   * @returns Stream with the student.
   */
  getStudent = (id: number): Observable<Student> => this.studentsEndpoint.getById(id);

  /**
   * Registers a student under the acting tutor.
   * @param student - Student to register.
   * @param relationshipType - Relationship between the tutor and the student.
   * @returns Stream with the created student.
   */
  createStudent = (student: Student, relationshipType: RelationshipType): Observable<Student> =>
    this.withActor(profileId => this.studentsEndpoint.register(student, profileId, relationshipType));

  /**
   * Updates the basic data of a student.
   * @param student - Student to update.
   * @returns Stream with the updated student.
   */
  updateStudent = (student: Student): Observable<Student> =>
    this.studentsEndpoint.update(student, student.id);

  // Profiles

  /**
   * Retrieves the acting profile (the API has no profile collection endpoint).
   * @returns Stream with a single-item collection.
   */
  getProfiles = (): Observable<(Tutor | Driver)[]> =>
    this.withActor(profileId => this.profilesEndpoint.getById(profileId).pipe(map(profile => [profile])));

  /**
   * Retrieves a profile by ID.
   * @param id - Profile identifier.
   * @returns Stream with the profile.
   */
  getProfile = (id: number): Observable<Tutor | Driver> => this.profilesEndpoint.getById(id);

  /**
   * Updates the contact phone of a profile (PATCH /profiles/{id}/contact).
   * @param profile - Profile to update.
   * @returns Stream with the updated profile.
   */
  updateProfile = (profile: Tutor | Driver): Observable<Tutor | Driver> =>
    this.profilesEndpoint.update(profile, profile.id);

  // Tutor-student relationships (subresource of /students/{id}/tutors)

  /**
   * Retrieves the tutor authorizations of every student of the acting tutor.
   * @returns Stream with the relationship collection.
   */
  getTutorStudentRelationships = (): Observable<TutorStudentRelationship[]> => this.getStudents().pipe(
    switchMap(students => students.length
      ? forkJoin(students.map(student => this.relationshipsEndpoint.getByStudent(student.id)))
        .pipe(map(batches => batches.flat()))
      : of([])));

  /**
   * Authorizes another tutor for a student.
   * @param relationship - Relationship to create.
   * @returns Stream with the created relationship.
   */
  createTutorStudentRelationship = (relationship: TutorStudentRelationship): Observable<TutorStudentRelationship> =>
    this.withActor(profileId => this.relationshipsEndpoint.authorize(relationship, profileId));

  /**
   * Revokes a tutor authorization.
   * @param relationship - Relationship to revoke.
   * @returns Stream with the revoked relationship.
   */
  revokeTutorStudentRelationship = (relationship: TutorStudentRelationship): Observable<TutorStudentRelationship> =>
    this.withActor(profileId => this.relationshipsEndpoint.revoke(relationship, profileId));

  // Data deletion requests

  /**
   * Retrieves the data-deletion requests created by the acting tutor.
   * @returns Stream with the request collection.
   */
  getDataDeletionRequests = (): Observable<DataDeletionRequest[]> =>
    this.withActor(profileId => this.deletionRequestsEndpoint.getByRequester(profileId));

  /**
   * Requests the deletion of a student's personal data on behalf of the acting tutor.
   * @param request - Request to create.
   * @returns Stream with the created request.
   */
  createDataDeletionRequest = (request: DataDeletionRequest): Observable<DataDeletionRequest> =>
    this.deletionRequestsEndpoint.create(request);

  // Service enrollments

  /**
   * Retrieves the enrollments of a student.
   * @param studentId - Student identifier.
   * @returns Stream with the enrollment collection.
   */
  getStudentEnrollments = (studentId: number): Observable<ServiceEnrollment[]> =>
    this.serviceEnrollmentsEndpoint.getByStudent(studentId);

  /**
   * Requests the transport service of a driver for a student, on behalf of the acting tutor.
   * @param studentId - Student identifier.
   * @param driverProfileId - Driver profile identifier.
   * @returns Stream with the created enrollment.
   */
  requestEnrollment = (studentId: number, driverProfileId: number): Observable<ServiceEnrollment> =>
    this.withActor(profileId => this.serviceEnrollmentsEndpoint.request(studentId, driverProfileId, profileId));

  /**
   * Cancels a pending enrollment requested by the acting tutor.
   * @param id - Enrollment identifier.
   * @returns Stream with the cancelled enrollment.
   */
  cancelEnrollment = (id: number): Observable<ServiceEnrollment> =>
    this.withActor(profileId => this.serviceEnrollmentsEndpoint.transition(id, 'cancel', profileId));

  /**
   * Retrieves the enrollments addressed to the acting driver.
   * @returns Stream with the enrollment collection.
   */
  getDriverEnrollments = (): Observable<ServiceEnrollment[]> =>
    this.withActor(profileId => this.serviceEnrollmentsEndpoint.getByDriver(profileId));

  /**
   * Retrieves the students with an enrollment addressed to the acting driver.
   * @returns Stream with the student collection.
   */
  getDriverStudents = (): Observable<Student[]> =>
    this.withActor(profileId => this.serviceEnrollmentsEndpoint.getDriverStudents(profileId));

  /**
   * Accepts an enrollment addressed to the acting driver.
   * @param id - Enrollment identifier.
   * @returns Stream with the accepted enrollment.
   */
  acceptEnrollment = (id: number): Observable<ServiceEnrollment> =>
    this.withActor(profileId => this.serviceEnrollmentsEndpoint.transition(id, 'accept', profileId));

  /**
   * Ends an enrollment.
   * @param id - Enrollment identifier.
   * @returns Stream with the ended enrollment.
   */
  endEnrollment = (id: number): Observable<ServiceEnrollment> =>
    this.withActor(profileId => this.serviceEnrollmentsEndpoint.transition(id, 'end', profileId));
}
