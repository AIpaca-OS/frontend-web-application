import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ProfilesRelationshipStore } from '../../../application/profiles-relationship-management-store';

/** Explicit tutor consent: student registration does NOT enroll the child automatically. */
@Component({
  selector: 'app-student-enrollments',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section class="enrollment-card" aria-labelledby="enroll-heading">
      <h2 id="enroll-heading">{{ 'profiles.enrollments.tutorTitle' | translate }}</h2>
      <p>{{ 'profiles.enrollments.tutorDescription' | translate }}</p>
      @if (store.enrollmentsLoading()) {
        <p role="status">{{ 'profiles.enrollments.loading' | translate }}</p>
      }
      @if (store.enrollmentsError()) { <p class="error" role="alert">{{ store.enrollmentsError()! | translate }}</p> }
      @if (requested()) { <p class="notice" role="status">{{ 'profiles.enrollments.requested' | translate }}</p> }
      @for (enrollment of enrollments(); track enrollment.id) {
        <div class="entry">
          <div>
            <strong>{{ 'profiles.enrollments.driverLabel' | translate }} #{{ enrollment.driverProfileId }}</strong>
            <p>{{ 'profiles.enrollments.status' | translate }}: {{ 'profiles.enrollments.statuses.' + enrollment.status | translate }}</p>
          </div>
          @if (enrollment.status === 'PENDING') {
            <button type="button" [disabled]="store.enrollmentsLoading()" (click)="cancel(enrollment.id)">
              {{ 'profiles.enrollments.cancel' | translate }}
            </button>
          }
        </div>
      }
      @if (!store.enrollmentsLoading() && !hasOpenEnrollment()) {
        <div class="entry">
          <label for="driver-profile-id">{{ 'profiles.enrollments.driverProfileId' | translate }}</label>
          <input id="driver-profile-id" #driverId type="number" min="1" step="1"
            [value]="driverProfileId() ?? ''"
            (input)="driverProfileId.set(driverId.value ? +driverId.value : null)" />
          <button type="button" class="primary" [disabled]="store.enrollmentsLoading() || !validDriverId()"
            (click)="request()">{{ 'profiles.enrollments.request' | translate }}</button>
        </div>
      }
      <button type="button" class="refresh" [disabled]="store.enrollmentsLoading()" (click)="reload()">
        {{ 'profiles.enrollments.refresh' | translate }}
      </button>
    </section>
  `,
  styles: [`
    .enrollment-card { background:#fff; border:1px solid #dce9e3; padding:22px;
      border-radius:16px; margin:20px 0; display:grid; gap:12px; color:#173d34; }
    h2 { margin:0; font-size:19px; } p { margin:2px 0; color:#536e65; font-size:13px; }
    .entry { display:flex; justify-content:space-between; align-items:center;
      flex-wrap:wrap; gap:14px; padding:14px; border:1px solid #e5eeea; border-radius:12px; }
    .entry strong { font-size:14px; } button { border:1px solid #4e977d; background:#fff; color:#145c49;
      border-radius:10px; padding:10px 14px; cursor:pointer; font-weight:650; }
    button.primary { background:#199776; color:#fff; border-color:#199776; }
    button:disabled { opacity:.5; cursor:default; } .refresh { justify-self:start; }
    .error { color:#a22e2e; } .notice { color:#147c5e; }
    small { color:#6f8079; font-size:11px; }
  `],
})
export class StudentEnrollmentsComponent implements OnInit {
  readonly studentId = input.required<number>();
  readonly store = inject(ProfilesRelationshipStore);
  readonly driverProfileId = signal<number | null>(null);
  readonly requested = signal(false);
  readonly enrollments = computed(() =>
    this.store.enrollments().filter(enrollment => enrollment.studentId === this.studentId()));

  ngOnInit(): void { this.reload(); }

  /** True when the student already has a pending or accepted enrollment. */
  hasOpenEnrollment(): boolean {
    return this.enrollments().some(enrollment => enrollment.status === 'PENDING' || enrollment.status === 'ACCEPTED');
  }

  /** True when the typed driver profile ID is a positive integer. */
  validDriverId(): boolean {
    const id = this.driverProfileId();
    return id !== null && Number.isSafeInteger(id) && id > 0;
  }

  /** Reloads the enrollments of the student. */
  reload(): void { this.store.loadStudentEnrollments([this.studentId()]); }

  /** Requests the transport service of the typed driver. */
  async request(): Promise<void> {
    const driverProfileId = this.driverProfileId();
    if (!this.validDriverId() || driverProfileId === null || this.hasOpenEnrollment()) return;
    this.requested.set(false);
    this.requested.set(await this.store.requestEnrollment(this.studentId(), driverProfileId));
  }

  /**
   * Cancels a pending request.
   * @param id - Enrollment identifier.
   */
  cancel(id: number): void {
    this.requested.set(false);
    this.store.cancelEnrollment(id);
  }
}
