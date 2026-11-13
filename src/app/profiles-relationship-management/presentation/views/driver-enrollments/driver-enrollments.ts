import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ProfilesRelationshipStore } from '../../../application/profiles-relationship-management-store';

/**
 * Service requests addressed to the acting driver and the students already enrolled.
 */
@Component({
  selector: 'app-driver-enrollments',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <main class="driver-enrollments">
      <p class="eyebrow">Rumbo · {{ 'profiles.enrollments.driverTitle' | translate }}</p>
      <h1>{{ 'profiles.enrollments.driverTitle' | translate }}</h1>
      <p>{{ 'profiles.enrollments.driverDescription' | translate }}</p>
      @if (store.enrollmentsError()) { <p role="alert" class="error">{{ store.enrollmentsError()! | translate }}</p> }
      @if (accepted()) { <p role="status" class="message">{{ 'profiles.enrollments.acceptedMessage' | translate }}</p> }
      <div class="actions">
        <button type="button" [disabled]="store.enrollmentsLoading()" (click)="reload()">
          {{ 'profiles.enrollments.refresh' | translate }}
        </button>
        <a routerLink="/driver/routes/new">{{ 'profiles.enrollments.createRoute' | translate }}</a>
      </div>
      <section class="panel">
        <h2>{{ 'profiles.enrollments.pendingTitle' | translate }}</h2>
        @if (store.enrollmentsLoading()) { <p role="status">{{ 'profiles.enrollments.loading' | translate }}</p> }
        @for (enrollment of pending(); track enrollment.id) {
          <div class="entry">
            <div>
              <strong>{{ studentLabel(enrollment.studentId) }}</strong>
              <p>{{ 'profiles.enrollments.pendingHint' | translate }}</p>
            </div>
            <button type="button" class="primary" [disabled]="store.enrollmentsLoading()" (click)="accept(enrollment.id)">
              {{ 'profiles.enrollments.accept' | translate }}
            </button>
          </div>
        }
        @if (!store.enrollmentsLoading() && !pending().length) {
          <p>{{ 'profiles.enrollments.noPendingHint' | translate }}</p>
        }
      </section>
      <section class="panel">
        <h2>{{ 'profiles.enrollments.acceptedTitle' | translate }}</h2>
        @for (enrollment of acceptedEnrollments(); track enrollment.id) {
          <div class="entry">
            <div>
              <strong>{{ studentLabel(enrollment.studentId) }}</strong>
              <p>{{ 'profiles.enrollments.status' | translate }}: {{ 'profiles.enrollments.statuses.' + enrollment.status | translate }}</p>
            </div>
            <button type="button" [disabled]="store.enrollmentsLoading()" (click)="end(enrollment.id)">
              {{ 'profiles.enrollments.end' | translate }}
            </button>
          </div>
        }
        @if (!store.enrollmentsLoading() && !acceptedEnrollments().length) {
          <p>{{ 'profiles.enrollments.noAccepted' | translate }}</p>
        }
      </section>
    </main>
  `,
  styles: [`
    .driver-enrollments { box-sizing:border-box;width:100%;max-width:var(--rumbo-page-max-width);margin:0 auto;padding:var(--rumbo-page-padding);
      display:grid; gap:18px; color:#173d34; }
    .eyebrow { color:#17816b; font-size:12px; font-weight:700; letter-spacing:.09em; margin:0; text-transform:uppercase; }
    h1 { font-size:29px; margin:0; } h2 { font-size:19px; margin:0 0 12px; }
    p { font-size:13px; color:#58756a; margin:4px 0; }
    .panel { padding:22px; border:1px solid #dde9e3; border-radius:14px; background:#fff; }
    .entry { display:flex; align-items:center; justify-content:space-between; gap:16px;
      padding:14px 0; border-top:1px solid #e5eee9; flex-wrap:wrap; }
    .entry strong { font-size:14px; }
    .actions { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
    .actions a,button { border:1px solid #3c8d74; color:#155c48; background:#fff; border-radius:10px;
      padding:10px 15px; font-weight:650; text-decoration:none; cursor:pointer; }
    button.primary { color:#fff; background:#1a9c79; border-color:#1a9c79; }
    button:disabled { opacity:.5; cursor:default; }
    .error { color:#b33b38; } .message { color:#116a50; }
    small { color:#637d73; }
  `],
})
export class DriverEnrollmentsComponent implements OnInit {
  readonly store = inject(ProfilesRelationshipStore);
  private readonly translate = inject(TranslateService);
  readonly accepted = signal(false);
  readonly pending = computed(() => this.store.enrollments().filter(enrollment => enrollment.status === 'PENDING'));
  readonly acceptedEnrollments = computed(() => this.store.enrollments().filter(enrollment => enrollment.status === 'ACCEPTED'));

  ngOnInit(): void { this.reload(); }

  /**
   * Builds the label of a student (name when the summary is available).
   * @param id - Student identifier.
   * @returns Student label.
   */
  studentLabel(id: number): string {
    const student = this.store.driverStudents().find(current => current.id === id);
    return student ? student.fullName : this.translate.instant('profiles.enrollments.studentReference', { id });
  }

  /** Reloads the enrollments addressed to the driver. */
  reload(): void {
    this.accepted.set(false);
    this.store.loadDriverEnrollments();
  }

  /**
   * Accepts a pending request.
   * @param id - Enrollment identifier.
   */
  async accept(id: number): Promise<void> {
    this.accepted.set(await this.store.acceptEnrollment(id));
  }

  /**
   * Ends an accepted enrollment.
   * @param id - Enrollment identifier.
   */
  end(id: number): void {
    this.accepted.set(false);
    this.store.endEnrollment(id);
  }
}
