import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import {
  DemoDriver, ServiceEnrollment, ServiceEnrollmentsApi,
} from '../../../infrastructure/service-enrollments-api';

/** Explicit tutor consent: student registration does NOT enroll the child automatically. */
@Component({
  selector: 'app-student-enrollments',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section class="enrollment-card" aria-labelledby="enroll-heading">
      <h2 id="enroll-heading">{{ 'profiles.enrollments.tutorTitle' | translate }}</h2>
      <p>{{ 'profiles.enrollments.tutorDescription' | translate }}</p>
      @if (loading()) {
        <p role="status">{{ 'profiles.enrollments.loading' | translate }}</p>
      }
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      @if (message()) { <p class="notice" role="status">{{ message() }}</p> }
      @for (enrollment of enrollments(); track enrollment.id) {
        <div class="entry">
          <div>
            <strong>{{ 'profiles.enrollments.driverLabel' | translate }} #{{ enrollment.driverProfileId }}</strong>
            <p>{{ 'profiles.enrollments.status' | translate }}: {{ enrollment.status }}</p>
          </div>
          @if (enrollment.status === 'PENDING') {
            <button type="button" [disabled]="saving()" (click)="cancel(enrollment.id)">
              {{ 'profiles.enrollments.cancel' | translate }}
            </button>
          }
        </div>
      }
      @if (!loading() && !hasOpenEnrollment()) {
        @for (driver of drivers(); track driver.id) {
          <div class="entry">
            <div>
              <strong>{{ driver.displayName }}</strong>
              <p>{{ 'profiles.enrollments.requestExplanation' | translate }}</p>
            </div>
            <button type="button" class="primary" [disabled]="saving()" (click)="request(driver)">
              {{ 'profiles.enrollments.request' | translate }}
            </button>
          </div>
        }
        @if (!drivers().length && !error()) {
          <p>{{ 'profiles.enrollments.noDrivers' | translate }}</p>
        }
      }
      <button type="button" class="refresh" [disabled]="loading() || saving()" (click)="reload()">
        {{ 'profiles.enrollments.refresh' | translate }}
      </button>
      <small>{{ 'profiles.enrollments.demoDisclaimer' | translate }}</small>
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
  @Input({ required: true }) studentId!: number;
  private readonly api = inject(ServiceEnrollmentsApi);
  readonly drivers = signal<DemoDriver[]>([]);
  readonly enrollments = signal<ServiceEnrollment[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly message = signal('');

  ngOnInit(): void { void this.reload(); }

  hasOpenEnrollment(): boolean {
    return this.enrollments().some(e => e.status === 'PENDING' || e.status === 'ACCEPTED');
  }

  async reload(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    try {
      const [drivers, enrollments] = await Promise.all([
        firstValueFrom(this.api.availableDemoDrivers()),
        firstValueFrom(this.api.forStudent(this.studentId)),
      ]);
      this.drivers.set(drivers);
      this.enrollments.set(enrollments);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo consultar la afiliación');
    } finally {
      this.loading.set(false);
    }
  }

  async request(driver: DemoDriver): Promise<void> {
    if (this.saving() || this.hasOpenEnrollment()) return;
    this.saving.set(true);
    this.error.set('');
    this.message.set('');
    try {
      await firstValueFrom(this.api.request(this.studentId, driver.id));
      this.message.set('Solicitud registrada. El conductor debe aceptarla antes de asignar rutas.');
      await this.reload();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo solicitar el servicio');
    } finally {
      this.saving.set(false);
    }
  }

  async cancel(id: number): Promise<void> {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    try {
      await firstValueFrom(this.api.cancel(id));
      await this.reload();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo cancelar la solicitud');
    } finally {
      this.saving.set(false);
    }
  }
}
