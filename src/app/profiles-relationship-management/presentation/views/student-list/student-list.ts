import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ProfilesRelationshipStore } from '../../../application/profiles-relationship-management-store';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { ServiceEnrollment, ServiceEnrollmentsApi } from '../../../infrastructure/service-enrollments-api';

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
  private readonly serviceApi = inject(ServiceEnrollmentsApi);
  readonly enrollmentStates = signal<Record<number, 'NONE' | 'PENDING' | 'ACCEPTED'>>({});
  readonly enrollmentLoading = signal(false);
  readonly enrollmentBusyId = signal<number | null>(null);
  readonly enrollmentError = signal('');
  readonly enrollmentNotice = signal('');
  private lastStudents = '';

  constructor() {
    effect(() => {
      if (!this.localTransportDemo) return;
      const ids = this.store.students().map(s => s.id).sort((a, b) => a - b).join(',');
      if (ids !== this.lastStudents) {
        this.lastStudents = ids;
        if (ids) void this.refreshEnrollments();
      }
    });
  }

  statusFor(studentId: number): 'NONE' | 'PENDING' | 'ACCEPTED' {
    return this.enrollmentStates()[studentId] ?? 'NONE';
  }

  private activeStatus(enrollments: ServiceEnrollment[]): 'NONE' | 'PENDING' | 'ACCEPTED' {
    return enrollments.some(e => e.status === 'ACCEPTED') ? 'ACCEPTED'
      : enrollments.some(e => e.status === 'PENDING') ? 'PENDING' : 'NONE';
  }

  async refreshEnrollments(): Promise<void> {
    if (this.enrollmentLoading() || !this.localTransportDemo) return;
    this.enrollmentLoading.set(true);
    this.enrollmentError.set('');
    try {
      const students = this.store.students();
      const statuses = await Promise.all(students.map(async student => ({
        id: student.id,
        status: this.activeStatus(await firstValueFrom(this.serviceApi.forStudent(student.id))),
      })));
      this.enrollmentStates.set(Object.fromEntries(statuses.map(x => [x.id, x.status])));
    } catch {
      this.enrollmentError.set('No se pudo consultar el estado del transporte. Comprueba que Spring Boot esté disponible.');
    } finally {
      this.enrollmentLoading.set(false);
    }
  }

  async requestTransport(studentId: number): Promise<void> {
    if (this.enrollmentBusyId() !== null || this.statusFor(studentId) !== 'NONE') return;
    this.enrollmentBusyId.set(studentId);
    this.enrollmentError.set('');
    this.enrollmentNotice.set('');
    try {
      // Re-check persisted state to avoid duplicate requests after a stale list view.
      const existing = await firstValueFrom(this.serviceApi.forStudent(studentId));
      if (this.activeStatus(existing) !== 'NONE') {
        this.enrollmentStates.update(prev => ({ ...prev, [studentId]: this.activeStatus(existing) }));
        return;
      }
      const drivers = await firstValueFrom(this.serviceApi.availableDemoDrivers());
      // With multiple drivers, the student detail permits the tutor to select one explicitly.
      if (drivers.length !== 1) {
        await this.router.navigate(['/tutor/students', studentId]);
        return;
      }
      await firstValueFrom(this.serviceApi.request(studentId, drivers[0].id));
      this.enrollmentStates.update(prev => ({ ...prev, [studentId]: 'PENDING' }));
      this.enrollmentNotice.set(
        'Solicitud enviada al conductor. Cuando la acepte, el estudiante estará disponible para sus rutas.');
    } catch (e) {
      const response = e as { status?: number; error?: { detail?: string } };
      this.enrollmentError.set(response.status === 0
        ? 'No hay conexión con el backend. Revisa que Spring Boot esté ejecutándose.'
        : response.error?.detail ?? 'No se pudo enviar la solicitud de transporte.');
    } finally {
      this.enrollmentBusyId.set(null);
    }
  }


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
