import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import {
  EnrolledStudent, ServiceEnrollment, ServiceEnrollmentsApi,
} from '../../../infrastructure/service-enrollments-api';

@Component({
  selector: 'app-driver-enrollments',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <main class="driver-enrollments">
      <p class="eyebrow">RUMBO · {{ 'profiles.enrollments.driverTitle' | translate }}</p>
      <h1>{{ 'profiles.enrollments.driverTitle' | translate }}</h1>
      <p>{{ 'profiles.enrollments.driverDescription' | translate }}</p>
      @if (error()) { <p role="alert" class="error">{{ error() }}</p> }
      @if (message()) { <p role="status" class="message">{{ message() }}</p> }
      <div class="actions">
        <button type="button" [disabled]="loading() || saving()" (click)="reload()">
          {{ 'profiles.enrollments.refresh' | translate }}
        </button>
        <a routerLink="/driver/routes/new">{{ 'profiles.enrollments.createRoute' | translate }}</a>
      </div>
      <section class="panel">
        <h2>{{ 'profiles.enrollments.pendingTitle' | translate }}</h2>
        @if (loading()) { <p role="status">{{ 'profiles.enrollments.loading' | translate }}</p> }
        @for (enrollment of enrollments(); track enrollment.id) {
          @if (enrollment.status === 'PENDING') {
            <div class="entry">
              <div>
                <strong>{{ studentLabel(enrollment.studentId) }}</strong>
                <p>{{ 'profiles.enrollments.pendingHint' | translate }}</p>
              </div>
              <button type="button" class="primary" [disabled]="saving()" (click)="accept(enrollment.id)">
                {{ 'profiles.enrollments.accept' | translate }}
              </button>
            </div>
          }
        }
        @if (!loading() && !pendingCount()) {
          <p>No hay solicitudes pendientes. El tutor debe registrar al estudiante
             y pulsar «Solicitar transporte» para enviarte la solicitud.</p>
        }
      </section>
      <section class="panel">
        <h2>{{ 'profiles.enrollments.acceptedTitle' | translate }}</h2>
        @for (enrollment of enrollments(); track enrollment.id) {
          @if (enrollment.status === 'ACCEPTED') {
            <div class="entry">
              <div>
                <strong>{{ studentLabel(enrollment.studentId) }}</strong>
                <p>{{ 'profiles.enrollments.status' | translate }}: {{ enrollment.status }}</p>
              </div>
              <button type="button" [disabled]="saving()" (click)="end(enrollment.id)">
                {{ 'profiles.enrollments.end' | translate }}
              </button>
            </div>
          }
        }
        @if (!loading() && !acceptedCount()) {
          <p>{{ 'profiles.enrollments.noAccepted' | translate }}</p>
        }
      </section>
    </main>
  `,
  styles: [`
    .driver-enrollments { max-width:1040px; margin:auto; padding:32px 24px;
      display:grid; gap:18px; color:#173d34; }
    .eyebrow { color:#17816b; font-size:12px; font-weight:700; letter-spacing:.09em; margin:0; }
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
  private readonly api = inject(ServiceEnrollmentsApi);
  readonly enrollments = signal<ServiceEnrollment[]>([]);
  readonly students = signal<EnrolledStudent[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly message = signal('');

  private errorDescription(error: unknown): string {
    const response = error as { status?: number; error?: { detail?: string; message?: string } };
    const detail = response.error?.detail ?? response.error?.message;
    if (response.status === 0) return 'No se puede conectar al servidor. Comprueba que Spring Boot esté ejecutándose en el puerto 8080.';
    if (response.status === 401 || response.status === 403)
      return 'No se pudo validar el acceso del conductor. Vuelve a ingresar como conductor y comprueba que el backend local esté habilitado.';
    if (response.status === 404) return 'El endpoint de afiliaciones no está disponible. Actualiza y reinicia el backend.';
    return detail || 'No se pudieron consultar las solicitudes. Comprueba la API de afiliaciones.';
  }
  ngOnInit(): void { void this.reload(); }

  pendingCount(): number {
    return this.enrollments().filter(e => e.status === 'PENDING').length;
  }
  acceptedCount(): number {
    return this.enrollments().filter(e => e.status === 'ACCEPTED').length;
  }
  studentLabel(id: number): string {
    const student = this.students().find(s => s.id === id);
    return student ? student.firstName + ' ' + student.lastName
      : 'Estudiante #' + id;
  }
  async reload(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    try {
      const enrollments = await firstValueFrom(this.api.forDriver());
      this.enrollments.set(enrollments);
      // A student-name lookup must not hide the enrollment requests.
      try {
        this.students.set(await firstValueFrom(this.api.driverStudents()));
      } catch {
        this.students.set([]);
        this.error.set('Las solicitudes se cargaron, pero no fue posible consultar los nombres de los estudiantes.');
      }
    } catch (e) {
      this.error.set(this.errorDescription(e));
    } finally {
      this.loading.set(false);
    }
  }
  async accept(id: number): Promise<void> {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    try {
      await firstValueFrom(this.api.accept(id));
      this.message.set('Afiliación aceptada. Ahora puedes asignar al estudiante a una ruta.');
      await this.reload();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo aceptar la solicitud');
    } finally {
      this.saving.set(false);
    }
  }
  async end(id: number): Promise<void> {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    try {
      await firstValueFrom(this.api.end(id));
      await this.reload();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo finalizar la afiliación');
    } finally {
      this.saving.set(false);
    }
  }
}
