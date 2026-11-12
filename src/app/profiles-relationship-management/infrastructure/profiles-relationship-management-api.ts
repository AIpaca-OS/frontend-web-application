import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BaseApi } from '../../shared/infrastructure/base-api';

import { Student } from '../domain/model/student.entity';
import { Tutor } from '../domain/model/tutor.entity';
import { Driver } from '../domain/model/driver.entity';
import { TutorStudentRelationship } from '../domain/model/tutor-student-relationship.entity';
import { DataDeletionRequest } from '../domain/model/data-deletion-request.entity';

import { StudentsApiEndpoint } from './students-api-endpoint';
import { ProfilesApiEndpoint } from './profiles-api-endpoint';
import { TutorStudentRelationshipsApiEndpoint } from './tutor-student-relationships-api-endpoint';
import { DataDeletionRequestsApiEndpoint } from './data-deletion-requests-api-endpoint';
import { LocalProfilesApi } from './local-profiles-api';
import { environment } from '../../../environments/environment';

/**
 * Infrastructure facade for Profiles & Relationship Management operations.
 *
 * @remarks
 * This API provides a single access point to student profiles,
 * tutor and driver profiles, tutor-student relationships,
 * and student data deletion requests.
 *
 * Each operation delegates the HTTP communication to its
 * corresponding API endpoint.
 */
@Injectable({ providedIn: 'root' })
export class ProfilesRelationshipApi extends BaseApi {
  private readonly localApi = inject(LocalProfilesApi);
  // Spring Boot endpoints are shared across environments; access stays protected
  // until actual IAM is available (never fall back to unprotected MockAPI).
  private readonly useLocalBackend = environment.routePlanningApiMode === 'backend';
  /**
   * Angular HTTP client used by the API endpoints.
   */
  private readonly http = inject(HttpClient);

  /**
   * Endpoint responsible for student operations.
   */
  private readonly studentsEndpoint = new StudentsApiEndpoint(this.http);

  /**
   * Endpoint responsible for tutor and driver profile operations.
   */
  private readonly profilesEndpoint = new ProfilesApiEndpoint(this.http);

  /**
   * Endpoint responsible for tutor-student relationship operations.
   */
  private readonly relationshipsEndpoint = new TutorStudentRelationshipsApiEndpoint(this.http);

  /**
   * Endpoint responsible for student data deletion request operations.
   */
  private readonly deletionRequestsEndpoint = new DataDeletionRequestsApiEndpoint(this.http);

  // ---------------------------------------------------------
  // Students
  // ---------------------------------------------------------

  /**
   * Retrieves all students.
   *
   * @returns Stream containing the student collection.
   */
  getStudents = (): Observable<Student[]> => this.useLocalBackend ? this.localApi.getStudents() : this.studentsEndpoint.getAll();

  /**
   * Retrieves a student by ID.
   *
   * @param id - The identifier of the student.
   * @returns Stream containing the requested Student entity.
   */
  getStudent = (id: number): Observable<Student> => this.useLocalBackend ? this.localApi.getStudent(id) : this.studentsEndpoint.getById(id);

  /**
   * Creates a new student.
   *
   * @param student - The Student entity to create.
   * @returns Stream containing the created Student entity.
   */
  createStudent = (student: Student): Observable<Student> => this.useLocalBackend ? this.localApi.createStudent(student) : this.studentsEndpoint.create(student);

  /**
   * Updates an existing student.
   *
   * @param student - The Student entity to update.
   * @returns Stream containing the updated Student entity.
   */
  updateStudent = (student: Student): Observable<Student> =>
    this.useLocalBackend ? this.localApi.updateStudent(student) : this.studentsEndpoint.update(student, student.id);

  /**
   * Deletes a student by ID.
   *
   * @param id - The identifier of the student to delete.
   * @returns Stream that completes when the deletion succeeds.
   */
  deleteStudent = (id: number): Observable<void> => this.useLocalBackend ? this.localApi.deleteStudent(id) : this.studentsEndpoint.delete(id);

  // ---------------------------------------------------------
  // Profiles
  // ---------------------------------------------------------

  /**
   * Retrieves all tutor and driver profiles.
   *
   * @returns Stream containing Tutor and Driver entities.
   */
  getProfiles = (): Observable<(Tutor | Driver)[]> => this.useLocalBackend ? this.localApi.getProfiles() : this.profilesEndpoint.getAll();

  /**
   * Retrieves a profile by ID.
   *
   * @param id - The identifier of the profile.
   * @returns Stream containing a Tutor or Driver entity.
   */
  getProfile = (id: number): Observable<Tutor | Driver> => this.useLocalBackend ? this.localApi.getProfile(id) : this.profilesEndpoint.getById(id);

  /**
   * Creates a new tutor or driver profile.
   *
   * @param profile - The Tutor or Driver entity to create.
   * @returns Stream containing the created profile.
   */
  createProfile = (profile: Tutor | Driver): Observable<Tutor | Driver> =>
    this.useLocalBackend ? this.localApi.createProfile(profile) : this.profilesEndpoint.create(profile);

  /**
   * Updates an existing tutor or driver profile.
   *
   * @param profile - The profile entity to update.
   * @returns Stream containing the updated profile.
   */
  updateProfile = (profile: Tutor | Driver): Observable<Tutor | Driver> =>
    this.useLocalBackend ? this.localApi.updateProfile(profile) : this.profilesEndpoint.update(profile, profile.id);

  /**
   * Deletes a profile by ID.
   *
   * @param id - The identifier of the profile to delete.
   * @returns Stream that completes when the deletion succeeds.
   */
  deleteProfile = (id: number): Observable<void> => this.useLocalBackend ? this.localApi.deleteProfile(id) : this.profilesEndpoint.delete(id);

  // ---------------------------------------------------------
  // Tutor-Student Relationships
  // ---------------------------------------------------------

  /**
   * Retrieves all tutor-student relationships.
   *
   * @returns Stream containing the relationship collection.
   */
  getTutorStudentRelationships = (): Observable<TutorStudentRelationship[]> =>
    this.useLocalBackend ? this.localApi.getRelationships() : this.relationshipsEndpoint.getAll();

  /**
   * Retrieves a tutor-student relationship by ID.
   *
   * @param id - The identifier of the relationship.
   * @returns Stream containing the requested relationship.
   */
  getTutorStudentRelationship = (id: number): Observable<TutorStudentRelationship> =>
    this.useLocalBackend ? this.localApi.getRelationship(id) : this.relationshipsEndpoint.getById(id);

  /**
   * Creates a new tutor-student relationship.
   *
   * @param relationship - The relationship to create.
   * @returns Stream containing the created relationship.
   */
  createTutorStudentRelationship = (
    relationship: TutorStudentRelationship,
  ): Observable<TutorStudentRelationship> => this.useLocalBackend ? this.localApi.createRelationship(relationship) : this.relationshipsEndpoint.create(relationship);

  /**
   * Updates an existing tutor-student relationship.
   *
   * @param relationship - The relationship to update.
   * @returns Stream containing the updated relationship.
   */
  updateTutorStudentRelationship = (
    relationship: TutorStudentRelationship,
  ): Observable<TutorStudentRelationship> =>
    this.useLocalBackend ? this.localApi.updateRelationship(relationship) : this.relationshipsEndpoint.update(relationship, relationship.id);

  /**
   * Deletes a tutor-student relationship by ID.
   *
   * @param id - The identifier of the relationship to delete.
   * @returns Stream that completes when the deletion succeeds.
   */
  deleteTutorStudentRelationship = (id: number): Observable<void> =>
    this.useLocalBackend ? this.localApi.deleteRelationship(id) : this.relationshipsEndpoint.delete(id);

  // ---------------------------------------------------------
  // Data Deletion Requests
  // ---------------------------------------------------------

  /**
   * Retrieves all student data deletion requests.
   *
   * @returns Stream containing the deletion request collection.
   */
  getDataDeletionRequests = (): Observable<DataDeletionRequest[]> =>
    this.useLocalBackend ? this.localApi.getDeletionRequests() : this.deletionRequestsEndpoint.getAll();

  /**
   * Retrieves a data deletion request by ID.
   *
   * @param id - The identifier of the deletion request.
   * @returns Stream containing the requested deletion request.
   */
  getDataDeletionRequest = (id: number): Observable<DataDeletionRequest> =>
    this.useLocalBackend ? this.localApi.getDeletionRequest(id) : this.deletionRequestsEndpoint.getById(id);

  /**
   * Creates a new student data deletion request.
   *
   * @param request - The deletion request to create.
   * @returns Stream containing the created deletion request.
   */
  createDataDeletionRequest = (request: DataDeletionRequest): Observable<DataDeletionRequest> =>
    this.useLocalBackend ? this.localApi.createDeletionRequest(request) : this.deletionRequestsEndpoint.create(request);

  /**
   * Updates an existing student data deletion request.
   *
   * @param request - The deletion request to update.
   * @returns Stream containing the updated deletion request.
   */
  updateDataDeletionRequest = (request: DataDeletionRequest): Observable<DataDeletionRequest> =>
    this.useLocalBackend ? this.localApi.updateDeletionRequest(request) : this.deletionRequestsEndpoint.update(request, request.id);

  /**
   * Deletes a student data deletion request by ID.
   *
   * @param id - The identifier of the deletion request to delete.
   * @returns Stream that completes when the deletion succeeds.
   */
  deleteDataDeletionRequest = (id: number): Observable<void> =>
    this.useLocalBackend ? this.localApi.deleteDeletionRequest(id) : this.deletionRequestsEndpoint.delete(id);
}
