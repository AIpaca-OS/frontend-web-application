import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ProfilesRelationshipStore } from '../../../application/profiles-relationship-management-store';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';

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
  readonly localTransportDemo = !environment.production;

  private readonly router = inject(Router);

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
