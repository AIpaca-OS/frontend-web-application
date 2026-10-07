import {
  Component,
  computed,
  inject
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  ProfilesRelationshipStore
} from '../../../application/profiles-relationship-management-store';

import {
  AuthorizationStatus,
  TutorStudentRelationship
} from '../../../domain/model/tutor-student-relationship.entity';

import {
  DataDeletionRequest,
  DeletionRequestStatus
} from '../../../domain/model/data-deletion-request.entity';

/**
 * Displays a student's profile, authorized tutors,
 * and data privacy operations.
 */
@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './student-detail.html',
  styleUrl: './student-detail.css'
})
export class StudentDetail {

  readonly store =
    inject(ProfilesRelationshipStore);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  readonly studentId =
    Number(
      this.route.snapshot.paramMap.get('id')
    );

  readonly student =
    this.store.getStudentById(
      this.studentId
    );

  readonly relationships =
    this.store.getRelationshipsByStudentId(
      this.studentId
    );

  readonly authorizedRelationships =
    computed(() =>
      this.relationships().filter(
        relationship =>
          relationship.authorizationStatus ===
          AuthorizationStatus.AUTHORIZED
      )
    );

  readonly deletionRequests =
    this.store.getDeletionRequestsByStudentId(
      this.studentId
    );

  readonly activeDeletionRequest =
    computed(() =>
      this.deletionRequests().find(
        request =>
          request.status ===
          DeletionRequestStatus.PENDING
      )
    );

  getTutorName(tutorId: number): string {

    return this.store
      .tutors()
      .find(tutor => tutor.id === tutorId)
      ?.fullName ?? 'Tutor no disponible';
  }

  editStudent(): void {

    this.router
      .navigate([
        '/students',
        this.studentId,
        'edit'
      ])
      .then();
  }

  authorizeTutor(): void {

    this.router
      .navigate([
        '/students',
        this.studentId,
        'tutors',
        'new'
      ])
      .then();
  }

  revokeTutor(
    relationship: TutorStudentRelationship
  ): void {

    const updated =
      new TutorStudentRelationship({
        id: relationship.id,
        tutorId: relationship.tutorId,
        studentId: relationship.studentId,
        relationshipType:
        relationship.relationshipType,

        authorizationStatus:
        AuthorizationStatus.REVOKED,

        authorizedAt:
        relationship.authorizedAt,

        revokedAt:
          new Date().toISOString()
      });

    this.store.updateRelationship(updated);
  }

  /**
   * Temporary TB1 implementation.
   *
   * Once IAM exposes the authenticated tutor,
   * its identifier should be used instead.
   */
  requestDataDeletion(): void {

    const requester =
      this.authorizedRelationships()[0];

    if (!requester) {
      return;
    }

    const request =
      new DataDeletionRequest({
        id: 0,
        studentId: this.studentId,
        requestedByTutorId:
        requester.tutorId
      });

    this.store
      .addDataDeletionRequest(request);
  }
}
