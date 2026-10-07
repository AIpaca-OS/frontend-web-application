import { Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ProfilesRelationshipStore } from '../../../application/profiles-relationship-management-store';
import { Student, StudentStatus } from '../../../domain/model/student.entity';

/**
 * Form view used to create or update a student.
 */
@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './student-form.html',
  styleUrl: './student-form.css',
})
export class StudentForm {
  readonly store = inject(ProfilesRelationshipStore);
  readonly StudentStatus = StudentStatus;
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly studentId: number | null;
  readonly isEdit: boolean;
  private formInitialized = false;

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    birthDate: ['', Validators.required],
    schoolName: ['', Validators.required],
    status: this.fb.nonNullable.control<StudentStatus>(StudentStatus.ACTIVE, Validators.required),
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    this.studentId = id ? Number(id) : null;
    this.isEdit = this.studentId !== null;

    effect(() => {
      if (!this.isEdit || this.studentId === null || this.formInitialized) {
        return;
      }

      const student = this.store.students().find((current) => current.id === this.studentId);

      if (!student) {
        return;
      }

      this.form.patchValue({
        firstName: student.firstName,
        lastName: student.lastName,
        birthDate: student.birthDate,
        schoolName: student.schoolName,
        status: student.status,
      });

      this.formInitialized = true;
    });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();

    const student = new Student({
      id: this.studentId ?? 0,
      firstName: value.firstName,
      lastName: value.lastName,
      birthDate: value.birthDate,
      schoolName: value.schoolName,
      status: value.status,
    });

    if (this.isEdit) {
      this.store.updateStudent(student);
    } else {
      this.store.addStudent(student);
    }

    this.router.navigate(['/students']).then();
  }

  cancel(): void {
    this.router.navigate(['/students']).then();
  }
}
