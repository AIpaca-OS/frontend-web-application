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
import { StudentEnrollmentsComponent } from '../student-enrollments/student-enrollments';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DemoRoleSession } from '../../../../identity-and-access-management/application/demo-role-session.service';

/**
 * Displays a student's profile, authorized tutors,
 * and data privacy operations.
 */
@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    StudentEnrollmentsComponent,
    TranslatePipe
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

  private readonly translate =
    inject(TranslateService);

  private readonly session =
    inject(DemoRoleSession);

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

    const profile = this.store
      .tutors()
      .find(tutor => tutor.id === tutorId);

    return profile?.fullName
      ?? this.translate.instant('students.detail.tutorReference', { id: tutorId });
  }

  editStudent(): void {

    this.router
      .navigate([
        '/tutor/students',
        this.studentId,
        'edit'
      ])
      .then();
  }

  authorizeTutor(): void {

    this.router
      .navigate([
        '/tutor/students',
        this.studentId,
        'tutors',
        'new'
      ])
      .then();
  }

  revokeTutor(
    relationship: TutorStudentRelationship
  ): void {

    this.store.revokeRelationship(relationship);
  }

  /**
   * Requests the deletion of the student's personal data on behalf of the acting tutor.
   */
  requestDataDeletion(): void {

    const requesterId = this.session.profileId();

    if (!requesterId) {
      return;
    }

    const request =
      new DataDeletionRequest({
        id: 0,
        studentId: this.studentId,
        requestedByTutorId: requesterId
      });

    this.store
      .addDataDeletionRequest(request);
  }
}
