import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { ProfilesRelationshipStore } from '../../../application/profiles-relationship-management-store';

import {
  RelationshipType,
  TutorStudentRelationship,
} from '../../../domain/model/tutor-student-relationship.entity';

/**
 * Form used to authorize a tutor for a student.
 */
@Component({
  selector: 'app-relationship-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './relationship-form.html',
  styleUrl: './relationship-form.css',
})
export class RelationshipForm {
  readonly store = inject(ProfilesRelationshipStore);
  readonly RelationshipType = RelationshipType;
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly studentId = Number(this.route.snapshot.paramMap.get('id'));
  readonly form = this.fb.nonNullable.group({
    tutorId: [0, Validators.required],

    relationshipType: this.fb.nonNullable.control<RelationshipType>(
      RelationshipType.OTHER,
      Validators.required,
    ),
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();

    const relationship = new TutorStudentRelationship({
      id: 0,
      tutorId: Number(value.tutorId),
      studentId: this.studentId,
      relationshipType: value.relationshipType,
    });

    this.store.addRelationship(relationship);
    this.cancel();
  }

  cancel(): void {
    this.router.navigate(['/students', this.studentId]).then();
  }
}
