import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';

import { ProfilesRelationshipStore } from '../../../application/profiles-relationship-management-store';

import {
  RelationshipType,
  TutorStudentRelationship,
} from '../../../domain/model/tutor-student-relationship.entity';

/**
 * Form used to authorize another tutor for a student (POST /students/{id}/tutors).
 */
@Component({
  selector: 'app-relationship-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatInputModule, TranslatePipe],
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
    // The API has no tutor directory: the tutor is identified by its profile ID.
    tutorId: [0, [Validators.required, Validators.min(1)]],

    relationshipType: this.fb.nonNullable.control<RelationshipType>(
      RelationshipType.OTHER,
      Validators.required,
    ),
  });

  async submit(): Promise<void> {
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

    const saved = await this.store.addRelationship(relationship);
    if (saved) this.cancel();
  }

  cancel(): void {
    this.router.navigate(['/tutor/students', this.studentId]).then();
  }
}
