import { computed, DestroyRef, inject, Injectable, Signal, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { retry } from 'rxjs';

import { ProfilesRelationshipApi } from '../infrastructure/profiles-relationship-management-api';

import { Student } from '../domain/model/student.entity';
import { Tutor } from '../domain/model/tutor.entity';
import { Driver } from '../domain/model/driver.entity';

import { TutorStudentRelationship } from '../domain/model/tutor-student-relationship.entity';
import { DataDeletionRequest } from '../domain/model/data-deletion-request.entity';

/**
 * Holds Profiles & Relationship Management application state
 * and coordinates profile, student, relationship, and
 * data deletion request operations.
 */
@Injectable({
  providedIn: 'root',
})
export class ProfilesRelationshipStore {
  /**
   * Infrastructure API used by the application layer.
   */
  private readonly profilesRelationshipApi = inject(ProfilesRelationshipApi);

  /**
   * Destroy reference used to automatically unsubscribe
   * from API observables when the store is destroyed.
   */
  private readonly destroyRef = inject(DestroyRef);

  // =========================================================
  // Students
  // =========================================================

  private readonly studentsSignal = signal<Student[]>([]);

  /**
   * Readonly signal containing all students.
   */
  readonly students = this.studentsSignal.asReadonly();

  /**
   * Computed number of currently loaded students.
   */
  readonly studentCount = computed(() => this.students().length);

  // =========================================================
  // Profiles
  // =========================================================

  private readonly profilesSignal = signal<(Tutor | Driver)[]>([]);

  /**
   * Readonly signal containing all tutor and driver profiles.
   */
  readonly profiles = this.profilesSignal.asReadonly();

  /**
   * Computed collection containing only Tutor profiles.
   */
  readonly tutors = computed(() =>
    this.profiles().filter((profile): profile is Tutor => profile instanceof Tutor),
  );

  /**
   * Computed collection containing only Driver profiles.
   */
  readonly drivers = computed(() =>
    this.profiles().filter((profile): profile is Driver => profile instanceof Driver),
  );

  /**
   * Computed number of loaded profiles.
   */
  readonly profileCount = computed(() => this.profiles().length);

  /**
   * Computed number of Tutor profiles.
   */
  readonly tutorCount = computed(() => this.tutors().length);

  /**
   * Computed number of Driver profiles.
   */
  readonly driverCount = computed(() => this.drivers().length);

  // =========================================================
  // Tutor-Student Relationships
  // =========================================================

  private readonly relationshipsSignal = signal<TutorStudentRelationship[]>([]);

  /**
   * Readonly signal containing all tutor-student relationships.
   */
  readonly relationships = this.relationshipsSignal.asReadonly();

  /**
   * Computed number of tutor-student relationships.
   */
  readonly relationshipCount = computed(() => this.relationships().length);

  // =========================================================
  // Data Deletion Requests
  // =========================================================

  private readonly deletionRequestsSignal = signal<DataDeletionRequest[]>([]);

  /**
   * Readonly signal containing all student data deletion requests.
   */
  readonly deletionRequests = this.deletionRequestsSignal.asReadonly();

  /**
   * Computed number of deletion requests.
   */
  readonly deletionRequestCount = computed(() => this.deletionRequests().length);

  // =========================================================
  // Request State
  // =========================================================

  private readonly pendingRequestsSignal = signal<number>(0);

  /**
   * Indicates whether one or more API requests are in progress.
   */
  readonly loading = computed(() => this.pendingRequestsSignal() > 0);

  private readonly errorSignal = signal<string | null>(null);

  /**
   * Readonly signal containing the latest application error.
   */
  readonly error = this.errorSignal.asReadonly();

  /**
   * Creates an instance of ProfilesRelationshipStore
   * and loads the initial bounded context data.
   */
  constructor() {
    this.loadStudents();
    this.loadProfiles();
    this.loadRelationships();
    this.loadDeletionRequests();
  }

  // =========================================================
  // Student Selectors
  // =========================================================

  /**
   * Selects a student by identifier.
   *
   * @param id - Student identifier.
   * @returns Reactive selection for the requested student.
   */
  getStudentById = (id: number): Signal<Student | undefined> =>
    computed(() => (id ? this.students().find((student) => student.id === id) : undefined));

  // =========================================================
  // Profile Selectors
  // =========================================================

  /**
   * Selects a profile by identifier.
   *
   * @param id - Profile identifier.
   * @returns Reactive selection for the requested profile.
   */
  getProfileById = (id: number): Signal<Tutor | Driver | undefined> =>
    computed(() => (id ? this.profiles().find((profile) => profile.id === id) : undefined));

  /**
   * Selects a tutor by identifier.
   *
   * @param id - Tutor identifier.
   * @returns Reactive selection for the requested tutor.
   */
  getTutorById = (id: number): Signal<Tutor | undefined> =>
    computed(() => this.tutors().find((tutor) => tutor.id === id));

  /**
   * Selects a driver by identifier.
   *
   * @param id - Driver identifier.
   * @returns Reactive selection for the requested driver.
   */
  getDriverById = (id: number): Signal<Driver | undefined> =>
    computed(() => this.drivers().find((driver) => driver.id === id));

  // =========================================================
  // Relationship Selectors
  // =========================================================

  /**
   * Selects a tutor-student relationship by identifier.
   *
   * @param id - Relationship identifier.
   * @returns Reactive selection for the requested relationship.
   */
  getRelationshipById = (id: number): Signal<TutorStudentRelationship | undefined> =>
    computed(() => this.relationships().find((relationship) => relationship.id === id));

  /**
   * Selects relationships associated with a student.
   *
   * @param studentId - Student identifier.
   * @returns Reactive collection of matching relationships.
   */
  getRelationshipsByStudentId = (studentId: number): Signal<TutorStudentRelationship[]> =>
    computed(() =>
      this.relationships().filter((relationship) => relationship.studentId === studentId),
    );

  /**
   * Selects relationships associated with a tutor.
   *
   * @param tutorId - Tutor identifier.
   * @returns Reactive collection of matching relationships.
   */
  getRelationshipsByTutorId = (tutorId: number): Signal<TutorStudentRelationship[]> =>
    computed(() => this.relationships().filter((relationship) => relationship.tutorId === tutorId));

  // =========================================================
  // Deletion Request Selectors
  // =========================================================

  /**
   * Selects a deletion request by identifier.
   *
   * @param id - Deletion request identifier.
   * @returns Reactive selection for the requested request.
   */
  getDeletionRequestById = (id: number): Signal<DataDeletionRequest | undefined> =>
    computed(() => this.deletionRequests().find((request) => request.id === id));

  /**
   * Selects deletion requests associated with a student.
   *
   * @param studentId - Student identifier.
   * @returns Reactive collection of matching deletion requests.
   */
  getDeletionRequestsByStudentId = (studentId: number): Signal<DataDeletionRequest[]> =>
    computed(() => this.deletionRequests().filter((request) => request.studentId === studentId));

  // =========================================================
  // Student CRUD
  // =========================================================

  /**
   * Adds a new student.
   *
   * @param student - Student to create.
   */
  addStudent = (student: Student): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .createStudent(student)
      .pipe(retry(2))
      .subscribe({
        next: (createdStudent) => {
          this.studentsSignal.update((students) => [...students, createdStudent]);

          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to create student');
        },
      });
  };

  /**
   * Updates an existing student.
   *
   * @param updatedStudent - Student to update.
   */
  updateStudent = (updatedStudent: Student): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .updateStudent(updatedStudent)
      .pipe(retry(2))
      .subscribe({
        next: (student) => {
          this.studentsSignal.update((students) =>
            students.map((current) => (current.id === student.id ? student : current)),
          );

          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to update student');
        },
      });
  };

  /**
   * Deletes a student by identifier.
   *
   * @param id - Student identifier.
   */
  deleteStudent = (id: number): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .deleteStudent(id)
      .pipe(retry(2))
      .subscribe({
        next: () => {
          this.studentsSignal.update((students) => students.filter((student) => student.id !== id));

          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to delete student');
        },
      });
  };

  // =========================================================
  // Profile CRUD
  // =========================================================

  /**
   * Adds a Tutor or Driver profile.
   *
   * @param profile - Profile to create.
   */
  addProfile = (profile: Tutor | Driver): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .createProfile(profile)
      .pipe(retry(2))
      .subscribe({
        next: (createdProfile) => {
          this.profilesSignal.update((profiles) => [...profiles, createdProfile]);

          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to create profile');
        },
      });
  };

  /**
   * Updates an existing Tutor or Driver profile.
   *
   * @param updatedProfile - Profile to update.
   */
  updateProfile = (updatedProfile: Tutor | Driver): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .updateProfile(updatedProfile)
      .pipe(retry(2))
      .subscribe({
        next: (profile) => {
          this.profilesSignal.update((profiles) =>
            profiles.map((current) => (current.id === profile.id ? profile : current)),
          );

          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to update profile');
        },
      });
  };

  /**
   * Deletes a profile by identifier.
   *
   * @param id - Profile identifier.
   */
  deleteProfile = (id: number): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .deleteProfile(id)
      .pipe(retry(2))
      .subscribe({
        next: () => {
          this.profilesSignal.update((profiles) => profiles.filter((profile) => profile.id !== id));

          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to delete profile');
        },
      });
  };

  // =========================================================
  // Tutor-Student Relationship CRUD
  // =========================================================

  /**
   * Adds a new tutor-student relationship.
   *
   * @param relationship - Relationship to create.
   */
  addRelationship = (relationship: TutorStudentRelationship): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .createTutorStudentRelationship(relationship)
      .pipe(retry(2))
      .subscribe({
        next: (createdRelationship) => {
          this.relationshipsSignal.update((relationships) => [
            ...relationships,
            createdRelationship,
          ]);

          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to create tutor-student relationship');
        },
      });
  };

  /**
   * Updates an existing tutor-student relationship.
   *
   * @param updatedRelationship - Relationship to update.
   */
  updateRelationship = (updatedRelationship: TutorStudentRelationship): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .updateTutorStudentRelationship(updatedRelationship)
      .pipe(retry(2))
      .subscribe({
        next: (relationship) => {
          this.relationshipsSignal.update((relationships) =>
            relationships.map((current) =>
              current.id === relationship.id ? relationship : current,
            ),
          );

          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to update tutor-student relationship');
        },
      });
  };

  /**
   * Deletes a tutor-student relationship.
   *
   * @param id - Relationship identifier.
   */
  deleteRelationship = (id: number): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .deleteTutorStudentRelationship(id)
      .pipe(retry(2))
      .subscribe({
        next: () => {
          this.relationshipsSignal.update((relationships) =>
            relationships.filter((relationship) => relationship.id !== id),
          );

          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to delete tutor-student relationship');
        },
      });
  };

  // =========================================================
  // Data Deletion Request CRUD
  // =========================================================

  /**
   * Adds a new student data deletion request.
   *
   * @param request - Deletion request to create.
   */
  addDataDeletionRequest = (request: DataDeletionRequest): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .createDataDeletionRequest(request)
      .pipe(retry(2))
      .subscribe({
        next: (createdRequest) => {
          this.deletionRequestsSignal.update((requests) => [...requests, createdRequest]);

          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to create data deletion request');
        },
      });
  };

  /**
   * Updates an existing student data deletion request.
   *
   * @param updatedRequest - Deletion request to update.
   */
  updateDataDeletionRequest = (updatedRequest: DataDeletionRequest): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .updateDataDeletionRequest(updatedRequest)
      .pipe(retry(2))
      .subscribe({
        next: (request) => {
          this.deletionRequestsSignal.update((requests) =>
            requests.map((current) => (current.id === request.id ? request : current)),
          );

          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to update data deletion request');
        },
      });
  };

  /**
   * Deletes a student data deletion request.
   *
   * @param id - Deletion request identifier.
   */
  deleteDataDeletionRequest = (id: number): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .deleteDataDeletionRequest(id)
      .pipe(retry(2))
      .subscribe({
        next: () => {
          this.deletionRequestsSignal.update((requests) =>
            requests.filter((request) => request.id !== id),
          );

          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to delete data deletion request');
        },
      });
  };

  // =========================================================
  // Initial Data Loading
  // =========================================================

  /**
   * Loads all students from the API.
   */
  private loadStudents = (): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .getStudents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (students) => {
          this.studentsSignal.set(students);
          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to load students');
        },
      });
  };

  /**
   * Loads all tutor and driver profiles from the API.
   */
  private loadProfiles = (): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .getProfiles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profiles) => {
          this.profilesSignal.set(profiles);
          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to load profiles');
        },
      });
  };

  /**
   * Loads all tutor-student relationships from the API.
   */
  private loadRelationships = (): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .getTutorStudentRelationships()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (relationships) => {
          this.relationshipsSignal.set(relationships);

          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to load tutor-student relationships');
        },
      });
  };

  /**
   * Loads all student data deletion requests from the API.
   */
  private loadDeletionRequests = (): void => {
    this.beginRequest();

    this.profilesRelationshipApi
      .getDataDeletionRequests()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (requests) => {
          this.deletionRequestsSignal.set(requests);

          this.endRequest();
        },

        error: (error) => {
          this.handleError(error, 'Failed to load data deletion requests');
        },
      });
  };

  // =========================================================
  // Request Helpers
  // =========================================================

  /**
   * Marks the beginning of an API operation.
   */
  private beginRequest = (): void => {
    this.pendingRequestsSignal.update((count) => count + 1);

    this.errorSignal.set(null);
  };

  /**
   * Marks the completion of an API operation.
   */
  private endRequest = (): void => {
    this.pendingRequestsSignal.update((count) => Math.max(0, count - 1));
  };

  /**
   * Handles an API error and restores the request state.
   *
   * @param error - Source error.
   * @param fallback - Default error message.
   */
  private handleError = (error: unknown, fallback: string): void => {
    this.errorSignal.set(this.formatError(error, fallback));

    this.endRequest();
  };

  /**
   * Normalizes unknown errors into a display-friendly message.
   *
   * @param error - Source error.
   * @param fallback - Default message when details are unavailable.
   * @returns Normalized error message.
   */
  private formatError = (error: unknown, fallback: string): string => {
    if (error instanceof Error) {
      return error.message.includes('Resource not found')
        ? `${fallback}: Not found`
        : error.message;
    }

    return fallback;
  };
}
