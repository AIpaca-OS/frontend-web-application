import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { ProfilesRelationshipStore } from '../../../application/profiles-relationship-management-store';
import { Tutor } from '../../../domain/model/tutor.entity';

/**
 * Displays a Tutor or Driver profile.
 */
@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './profile-detail.html',
  styleUrl: './profile-detail.css',
})
export class ProfileDetail {
  readonly store = inject(ProfilesRelationshipStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly profileId = Number(this.route.snapshot.paramMap.get('id'));
  readonly profile = this.store.getProfileById(this.profileId);

  getProfileType(): string {
    const profile = this.profile();
    return profile instanceof Tutor ? 'Tutor' : 'Conductor';
  }

  editProfile(): void {
    this.router.navigate(['/profiles', this.profileId, 'edit']).then();
  }
}
