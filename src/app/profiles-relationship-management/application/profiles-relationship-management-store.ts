import { computed, DestroyRef, inject, Injectable, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, forkJoin, map, of } from 'rxjs';

import { ProfilesRelationshipApi } from '../infrastructure/profiles-relationship-management-api';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';
import { toErrorMessageKey } from '../../shared/infrastructure/api-error';

import { Student } from '../domain/model/student.entity';
import { Tutor } from '../domain/model/tutor.entity';
import { Driver } from '../domain/model/driver.entity';
import { TutorStudentRelationship, RelationshipType } from '../domain/model/tutor-student-relationship.entity';
import { DataDeletionRequest } from '../domain/model/data-deletion-request.entity';
import { ServiceEnrollment } from '../domain/model/service-enrollment.entity';

/**
 * Holds Profiles & Relationship Management application state and coordinates profile, student,
 * relationship, data-deletion and service-enrollment operations.
 *
 * @remarks
 * `error` and `enrollmentsError` contain i18n keys that the views render with TranslatePipe.
 */
@Injectable({
  providedIn: 'root',
})
export class ProfilesRelationshipStore {
  private readonly profilesRelationshipApi = inject(ProfilesRelationshipApi);
  private readonly session = inject(DemoRoleSession);
  private readonly destroyRef = inject(DestroyRef);

  // Students

  private readonly studentsSignal = signal<Student[]>([]);

  /**
   * Readonly signal containing the students of the acting tutor.
   */
  readonly students = this.studentsSignal.asReadonly();

  /**
   * Computed number of currently loaded students.
   */
  readonly studentCount = computed(() => this.students().length);

  // Profiles

  private readonly profilesSignal = signal<(Tutor | Driver)[]>([]);

  /**
   * Readonly signal containing the loaded profiles.
   */
  readonly profiles = this.profilesSignal.asReadonly();

  /**
   * Computed collection containing only Tutor profiles.
   */
  readonly tutors = computed(() =>
    this.profiles().filter((profile): profile is Tutor => profile instanceof Tutor));

  /**
   * Computed collection containing only Driver profiles.
   */
  readonly drivers = computed(() =>
    this.profiles().filter((profile): profile is Driver => profile instanceof Driver));

  // Tutor-student relationships

  private readonly relationshipsSignal = signal<TutorStudentRelationship[]>([]);

  /**
   * Readonly signal containing the tutor-student relationships.
   */
  readonly relationships = this.relationshipsSignal.asReadonly();

  // Data deletion requests

  private readonly deletionRequestsSignal = signal<DataDeletionRequest[]>([]);

  /**
   * Readonly signal containing the data-deletion requests of the acting tutor.
   */
  readonly deletionRequests = this.deletionRequestsSignal.asReadonly();

  // Service enrollments

  private readonly enrollmentsSignal = signal<ServiceEnrollment[]>([]);

  /**
   * Readonly signal containing the loaded service enrollments
   * (the tutor's students' enrollments, or the enrollments addressed to the acting driver).
   */
  readonly enrollments = this.enrollmentsSignal.asReadonly();

  private readonly driverStudentsSignal = signal<Student[]>([]);

  /**
   * Readonly signal containing the students with an enrollment addressed to the acting driver.
   */
  readonly driverStudents = this.driverStudentsSignal.asReadonly();

  /**
   * Students whose enrollment was accepted by the acting driver (candidates for route stops).
   */
  readonly acceptedDriverStudents = computed(() => {
    const accepted = new Set(this.enrollments()
      .filter(enrollment => enrollment.status === 'ACCEPTED')
      .map(enrollment => enrollment.studentId));
    return this.driverStudents().filter(student => accepted.has(student.id));
  });

  private readonly enrollmentsLoadingSignal = signal<boolean>(false);

  /**
   * Indicates whether an enrollment operation is in progress.
   */
  readonly enrollmentsLoading = this.enrollmentsLoadingSignal.asReadonly();

  private readonly enrollmentsErrorSignal = signal<string | null>(null);

  /**
   * Readonly signal containing the latest enrollment error (i18n key).
   */
  readonly enrollmentsError = this.enrollmentsErrorSignal.asReadonly();

  // Request state

  private readonly pendingRequestsSignal = signal<number>(0);

  /**
   * Indicates whether one or more API requests are in progress.
   */
  readonly loading = computed(() => this.pendingRequestsSignal() > 0);

  private readonly errorSignal = signal<string | null>(null);

  /**
   * Readonly signal containing the latest application error (i18n key).
   */
  readonly error = this.errorSignal.asReadonly();

  /**
   * Creates an instance of ProfilesRelationshipStore and loads the data of the acting role.
   */
  constructor() {
    this.loadProfiles();
    if (this.session.role() === 'driver') {
      this.loadDriverEnrollments();
    } else {
      this.loadStudents();
      this.loadRelationships();
      this.loadDeletionRequests();
    }
  }

  // Selectors

  /**
   * Selects a student by identifier.
   * @param id - Student identifier.
   * @returns Reactive selection for the requested student.
   */
  getStudentById = (id: number): Signal<Student | undefined> =>
    computed(() => (id ? this.students().find(student => student.id === id) : undefined));

  /**
   * Selects a profile by identifier.
   * @param id - Profile identifier.
   * @returns Reactive selection for the requested profile.
   */
  getProfileById = (id: number): Signal<Tutor | Driver | undefined> =>
    computed(() => (id ? this.profiles().find(profile => profile.id === id) : undefined));

  /**
   * Selects relationships associated with a student.
   * @param studentId - Student identifier.
   * @returns Reactive collection of matching relationships.
   */
  getRelationshipsByStudentId = (studentId: number): Signal<TutorStudentRelationship[]> =>
    computed(() => this.relationships().filter(relationship => relationship.studentId === studentId));

  /**
   * Selects deletion requests associated with a student.
   * @param studentId - Student identifier.
   * @returns Reactive collection of matching deletion requests.
   */
  getDeletionRequestsByStudentId = (studentId: number): Signal<DataDeletionRequest[]> =>
    computed(() => this.deletionRequests().filter(request => request.studentId === studentId));

  /**
   * Selects the enrollments associated with a student.
   * @param studentId - Student identifier.
   * @returns Reactive collection of matching enrollments.
   */
  getEnrollmentsByStudentId = (studentId: number): Signal<ServiceEnrollment[]> =>
    computed(() => this.enrollments().filter(enrollment => enrollment.studentId === studentId));

  /**
   * Selects a student summary visible to the acting driver.
   * @param studentId - Student identifier.
   * @returns Reactive selection for the requested student.
   */
  getDriverStudentById = (studentId: number): Signal<Student | undefined> =>
    computed(() => this.driverStudents().find(student => student.id === studentId));

  // Students

  /**
   * Registers a new student under the acting tutor.
   * @param student - Student to create.
   * @param relationshipType - Relationship between tutor and student.
   * @returns True when the student was created.
   */
  addStudent = async (student: Student, relationshipType: RelationshipType = RelationshipType.OTHER): Promise<boolean> => {
    this.beginRequest();
    try {
      // A POST must not be retried automatically: it may have been persisted already.
      const created = await firstValueFrom(this.profilesRelationshipApi.createStudent(student, relationshipType));
      this.studentsSignal.update(students => [...students, created]);
      this.endRequest();
      this.loadRelationships();
      return true;
    } catch (error) {
      this.handleError(error, 'errors.createStudent');
      return false;
    }
  };

  /**
   * Updates an existing student.
   * @param updatedStudent - Student to update.
   * @returns True when the student was updated.
   */
  updateStudent = async (updatedStudent: Student): Promise<boolean> => {
    this.beginRequest();
    try {
      const saved = await firstValueFrom(this.profilesRelationshipApi.updateStudent(updatedStudent));
      this.studentsSignal.update(students => students.map(current => current.id === saved.id ? saved : current));
      this.endRequest();
      return true;
    } catch (error) {
      this.handleError(error, 'errors.updateStudent');
      return false;
    }
  };

  // Profiles

  /**
   * Updates the contact phone of a profile.
   * @param updatedProfile - Profile to update.
   */
  updateProfile = (updatedProfile: Tutor | Driver): void => {
    this.beginRequest();
    this.profilesRelationshipApi.updateProfile(updatedProfile).subscribe({
      next: profile => {
        this.profilesSignal.update(profiles => profiles.map(current => current.id === profile.id ? profile : current));
        this.endRequest();
      },
      error: error => this.handleError(error, 'errors.updateProfile')
    });
  };

  // Tutor-student relationships

  /**
   * Authorizes a tutor for a student.
   * @param relationship - Relationship to create.
   * @returns True when the authorization was created.
   */
  addRelationship = async (relationship: TutorStudentRelationship): Promise<boolean> => {
    this.beginRequest();
    try {
      const created = await firstValueFrom(this.profilesRelationshipApi.createTutorStudentRelationship(relationship));
      this.relationshipsSignal.update(relationships => [...relationships, created]);
      this.endRequest();
      return true;
    } catch (error) {
      this.handleError(error, 'errors.authorizeTutor');
      return false;
    }
  };

  /**
   * Revokes a tutor authorization.
   * @param relationship - Relationship to revoke.
   */
  revokeRelationship = (relationship: TutorStudentRelationship): void => {
    this.beginRequest();
    this.profilesRelationshipApi.revokeTutorStudentRelationship(relationship).subscribe({
      next: revoked => {
        this.relationshipsSignal.update(relationships =>
          relationships.map(current => current.id === revoked.id ? revoked : current));
        this.endRequest();
      },
      error: error => this.handleError(error, 'errors.revokeTutor')
    });
  };

  // Data deletion requests

  /**
   * Requests the deletion of a student's personal data.
   * @param request - Deletion request to create.
   */
  addDataDeletionRequest = (request: DataDeletionRequest): void => {
    this.beginRequest();
    this.profilesRelationshipApi.createDataDeletionRequest(request).subscribe({
      next: created => {
        this.deletionRequestsSignal.update(requests => [...requests, created]);
        this.endRequest();
      },
      error: error => this.handleError(error, 'errors.requestDataDeletion')
    });
  };

  // Service enrollments (tutor side)

  /**
   * Loads the enrollments of the given students, replacing the previous ones for those students.
   * @param studentIds - Student identifiers.
   */
  loadStudentEnrollments = (studentIds: number[]): void => {
    if (studentIds.length === 0) return;
    this.enrollmentsLoadingSignal.set(true);
    this.enrollmentsErrorSignal.set(null);
    forkJoin(studentIds.map(id => this.profilesRelationshipApi.getStudentEnrollments(id)))
      .pipe(map(batches => batches.flat()))
      .subscribe({
        next: enrollments => {
          const ids = new Set(studentIds);
          this.enrollmentsSignal.update(current => [
            ...current.filter(enrollment => !ids.has(enrollment.studentId)), ...enrollments]);
          this.enrollmentsLoadingSignal.set(false);
        },
        error: error => {
          this.enrollmentsErrorSignal.set(this.formatError(error, 'errors.loadEnrollments'));
          this.enrollmentsLoadingSignal.set(false);
        }
      });
  };

  /**
   * Requests the transport service of a driver for a student.
   * @param studentId - Student identifier.
   * @param driverProfileId - Driver profile identifier.
   * @returns True when the request was registered.
   */
  requestEnrollment = async (studentId: number, driverProfileId: number): Promise<boolean> => {
    this.enrollmentsLoadingSignal.set(true);
    this.enrollmentsErrorSignal.set(null);
    try {
      const created = await firstValueFrom(this.profilesRelationshipApi.requestEnrollment(studentId, driverProfileId));
      this.enrollmentsSignal.update(enrollments => [...enrollments, created]);
      return true;
    } catch (error) {
      this.enrollmentsErrorSignal.set(this.formatError(error, 'errors.requestEnrollment'));
      return false;
    } finally {
      this.enrollmentsLoadingSignal.set(false);
    }
  };

  /**
   * Cancels a pending enrollment.
   * @param id - Enrollment identifier.
   */
  cancelEnrollment = (id: number): void =>
    this.applyEnrollmentTransition(this.profilesRelationshipApi.cancelEnrollment(id), 'errors.cancelEnrollment');

  // Service enrollments (driver side)

  /**
   * Loads the enrollments addressed to the acting driver and the related student summaries.
   */
  loadDriverEnrollments = (): void => {
    this.enrollmentsLoadingSignal.set(true);
    this.enrollmentsErrorSignal.set(null);
    forkJoin({
      enrollments: this.profilesRelationshipApi.getDriverEnrollments(),
      // A student-name lookup failure must not hide the enrollment requests.
      students: this.profilesRelationshipApi.getDriverStudents().pipe(
        map(students => students as Student[] | null),
        catchError(() => of(null))),
    }).subscribe({
      next: ({ enrollments, students }) => {
        this.enrollmentsSignal.set(enrollments);
        this.driverStudentsSignal.set(students ?? []);
        this.enrollmentsLoadingSignal.set(false);
      },
      error: error => {
        this.enrollmentsErrorSignal.set(this.formatError(error, 'errors.loadEnrollments'));
        this.enrollmentsLoadingSignal.set(false);
      }
    });
  };

  /**
   * Accepts an enrollment addressed to the acting driver.
   * @param id - Enrollment identifier.
   * @returns True when the enrollment was accepted.
   */
  acceptEnrollment = async (id: number): Promise<boolean> => {
    this.enrollmentsLoadingSignal.set(true);
    this.enrollmentsErrorSignal.set(null);
    try {
      const accepted = await firstValueFrom(this.profilesRelationshipApi.acceptEnrollment(id));
      this.replaceEnrollment(accepted);
      this.enrollmentsLoadingSignal.set(false);
      this.loadDriverEnrollments();
      return true;
    } catch (error) {
      this.enrollmentsErrorSignal.set(this.formatError(error, 'errors.acceptEnrollment'));
      this.enrollmentsLoadingSignal.set(false);
      return false;
    }
  };

  /**
   * Ends an accepted enrollment.
   * @param id - Enrollment identifier.
   */
  endEnrollment = (id: number): void =>
    this.applyEnrollmentTransition(this.profilesRelationshipApi.endEnrollment(id), 'errors.endEnrollment');

  // Initial data loading

  /**
   * Loads the students of the acting tutor.
   */
  private loadStudents = (): void => {
    this.beginRequest();
    this.profilesRelationshipApi.getStudents().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: students => {
        this.studentsSignal.set(students);
        this.endRequest();
      },
      error: error => this.handleError(error, 'errors.loadStudents')
    });
  };

  /**
   * Loads the acting profile.
   */
  private loadProfiles = (): void => {
    this.beginRequest();
    this.profilesRelationshipApi.getProfiles().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: profiles => {
        this.profilesSignal.set(profiles);
        this.endRequest();
      },
      error: error => this.handleError(error, 'errors.loadProfile')
    });
  };

  /**
   * Loads the tutor authorizations of the acting tutor's students.
   */
  private loadRelationships = (): void => {
    this.beginRequest();
    this.profilesRelationshipApi.getTutorStudentRelationships().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: relationships => {
        this.relationshipsSignal.set(relationships);
        this.endRequest();
      },
      error: error => this.handleError(error, 'errors.loadRelationships')
    });
  };

  /**
   * Loads the data-deletion requests of the acting tutor.
   */
  private loadDeletionRequests = (): void => {
    this.beginRequest();
    this.profilesRelationshipApi.getDataDeletionRequests().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: requests => {
        this.deletionRequestsSignal.set(requests);
        this.endRequest();
      },
      error: error => this.handleError(error, 'errors.loadDeletionRequests')
    });
  };

  // Helpers

  /**
   * Applies an enrollment transition and stores the returned enrollment.
   * @param request - Transition request.
   * @param fallback - Error key used when the transition fails.
   */
  private applyEnrollmentTransition = (request: ReturnType<ProfilesRelationshipApi['cancelEnrollment']>, fallback: string): void => {
    this.enrollmentsLoadingSignal.set(true);
    this.enrollmentsErrorSignal.set(null);
    request.subscribe({
      next: enrollment => {
        this.replaceEnrollment(enrollment);
        this.enrollmentsLoadingSignal.set(false);
      },
      error: error => {
        this.enrollmentsErrorSignal.set(this.formatError(error, fallback));
        this.enrollmentsLoadingSignal.set(false);
      }
    });
  };

  /**
   * Replaces (or adds) an enrollment in the state.
   * @param enrollment - Enrollment returned by the API.
   */
  private replaceEnrollment = (enrollment: ServiceEnrollment): void => {
    this.enrollmentsSignal.update(enrollments => enrollments.some(current => current.id === enrollment.id)
      ? enrollments.map(current => current.id === enrollment.id ? enrollment : current)
      : [...enrollments, enrollment]);
  };

  /**
   * Marks the beginning of an API operation.
   */
  private beginRequest = (): void => {
    this.pendingRequestsSignal.update(count => count + 1);
    this.errorSignal.set(null);
  };

  /**
   * Marks the completion of an API operation.
   */
  private endRequest = (): void => {
    this.pendingRequestsSignal.update(count => Math.max(0, count - 1));
  };

  /**
   * Handles an API error and restores the request state.
   * @param error - Source error.
   * @param fallback - Default error key.
   */
  private handleError = (error: unknown, fallback: string): void => {
    this.errorSignal.set(this.formatError(error, fallback));
    this.endRequest();
  };

  /**
   * Normalizes unknown errors into an i18n key.
   * @param error - Source error.
   * @param fallback - Key used when the error carries no HTTP information.
   * @returns Translation key.
   */
  private formatError = (error: unknown, fallback: string): string => toErrorMessageKey(error, fallback);
}
