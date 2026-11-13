import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';

import { ProfilesRelationshipStore } from '../../../application/profiles-relationship-management-store';

/** Transport-service state shown for each student. */
type TransportState = 'NONE' | 'PENDING' | 'ACCEPTED';

/**
 * Displays the students managed by the current tutor.
 */
@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinner, TranslatePipe],
  templateUrl: './student-list.html',
  styleUrl: './student-list.css',
})
export class StudentList {
  readonly store = inject(ProfilesRelationshipStore);
  private readonly router = inject(Router);
  private lastStudents = '';

  /**
   * Loads the transport-service enrollments whenever the student collection changes.
   */
  constructor() {
    effect(() => {
      const ids = this.store.students().map(student => student.id).sort((a, b) => a - b);
      const key = ids.join(',');
      if (key !== this.lastStudents) {
        this.lastStudents = key;
        this.store.loadStudentEnrollments(ids);
      }
    });
  }

  /**
   * Computes the transport-service state of a student from its enrollments.
   * @param studentId - Student identifier.
   * @returns Transport-service state.
   */
  statusFor(studentId: number): TransportState {
    const enrollments = this.store.enrollments().filter(enrollment => enrollment.studentId === studentId);
    return enrollments.some(enrollment => enrollment.status === 'ACCEPTED') ? 'ACCEPTED'
      : enrollments.some(enrollment => enrollment.status === 'PENDING') ? 'PENDING' : 'NONE';
  }

  /** Reloads the transport-service state of every student. */
  refreshEnrollments(): void {
    this.store.loadStudentEnrollments(this.store.students().map(student => student.id));
  }

  /**
   * Opens the student detail, where the tutor selects the driver for the transport request.
   * @param studentId - Student identifier.
   */
  requestTransport(studentId: number): void {
    this.viewStudent(studentId);
  }

  createStudent(): void {
    this.router.navigate(['/tutor/students/new']).then();
  }

  viewStudent(id: number): void {
    this.router.navigate(['/tutor/students', id]).then();
  }

  editStudent(id: number): void {
    this.router.navigate(['/tutor/students', id, 'edit']).then();
  }
}
