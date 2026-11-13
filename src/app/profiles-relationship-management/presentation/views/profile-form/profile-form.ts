import { Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';

import { ProfilesRelationshipStore } from '../../../application/profiles-relationship-management-store';

import { Tutor } from '../../../domain/model/tutor.entity';
import { Driver } from '../../../domain/model/driver.entity';

/**
 * Form used to update a Tutor or Driver profile.
 */
@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, TranslatePipe],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.css',
})
export class ProfileForm {
  readonly store = inject(ProfilesRelationshipStore);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly profileId = Number(this.route.snapshot.paramMap.get('id'));
  readonly profile = this.store.getProfileById(this.profileId);
  private initialized = false;

  readonly form = this.fb.nonNullable.group({
    phoneNumber: [''],
  });

  constructor() {
    effect(() => {
      const profile = this.profile();

      if (!profile || this.initialized) {
        return;
      }

      this.form.patchValue({
        phoneNumber: profile.phoneNumber ?? '',
      });

      this.initialized = true;
    });
  }

  submit(): void {
    const current = this.profile();

    if (!current || this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();

    const props = {
      id: current.id,
      accountId: current.accountId,
      firstName: current.firstName,
      lastName: current.lastName,
      phoneNumber: value.phoneNumber.trim() || null,
    };

    const updated = current instanceof Tutor ? new Tutor(props) : new Driver(props);
    this.store.updateProfile(updated);
    this.cancel();
  }

  cancel(): void {
    this.router.navigate(['/profiles', this.profileId]).then();
  }
}
