import { Component, effect, inject, signal } from '@angular/core';
import {
  AbstractControl, FormArray, FormBuilder, FormControl, FormGroup,
  ReactiveFormsModule, ValidationErrors, Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouteTripStore } from '../../../application/route-trip.store';
import { Route, RouteShift } from '../../../domain/model/route.entity';
import { RouteStop } from '../../../domain/model/route-stop.entity';
import { RouteStudentCatalog, RouteStudentOption } from '../../../infrastructure/route-student-catalog';
import { firstValueFrom } from 'rxjs';
import {
  ROUTE_WEEKDAY_LABELS, ROUTE_WEEKDAYS, RouteSchedule, RouteWeekday,
  isValidRouteSchedule, isValidRouteTime,
} from '../../../domain/model/route-schedule.entity';

type StopForm = FormGroup<{
  id: FormControl<string>;
  address: FormControl<string>;
  studentId: FormControl<string>;
  studentName: FormControl<string>;
}>;

type DayForm = FormGroup<{
  dayOfWeek: FormControl<RouteWeekday>;
  enabled: FormControl<boolean>;
  departureTime: FormControl<string>;
}>;

/** Un día inactivo no requiere hora; si se selecciona, sí es obligatoria. */
function validateServiceDay(control: AbstractControl): ValidationErrors | null {
  const value = control.value as { enabled: boolean; departureTime: string };
  return !value.enabled || isValidRouteTime(value.departureTime)
    ? null
    : { departureTimeRequired: true };
}

@Component({
  selector: 'app-route-form',
  standalone: true,
  imports: [
    MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatSelectModule, ReactiveFormsModule,
  ],
  templateUrl: './route-form.component.html',
  styleUrls: ['./route-form.component.css', './route-students.component.css'],
})
export class RouteFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(RouteTripStore);
  private readonly studentCatalog = inject(RouteStudentCatalog);
  readonly students = signal<RouteStudentOption[]>([]);
  readonly studentsLoading = signal(false);
  readonly studentsLoaded = signal(false);
  readonly studentsError = signal('');
  assignmentMessage = ''; 
  readonly weekdayLabels = ROUTE_WEEKDAY_LABELS;

  readonly stops = new FormArray<StopForm>([], { validators: Validators.minLength(1) });
  readonly serviceDays = new FormArray<DayForm>(
    ROUTE_WEEKDAYS.map(day => this.createServiceDay(day)),
  );
  readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    departureTime: this.fb.nonNullable.control('07:30', Validators.required),
    shift: this.fb.nonNullable.control<RouteShift>('MORNING', Validators.required),
    stops: this.stops,
    serviceDays: this.serviceDays,
  });

  isEdit = false;
  routeId: number | null = null;
  codePreview = '';
  routeStatus = 'CONFIGURABLE';
  saving = false;
  legacyRouteWithoutStops = false;
  scheduleMessage = '';
  activeStep = 0;
  stepMessage = '';
  readonly stepTitles = ['Datos generales', 'Paradas', 'Horarios', 'Resumen'];
  private patchedRouteId: number | null = null;

  constructor() {
    this.addStop();
    this.activatedRoute.paramMap.subscribe(params => {
      const raw = params.get('id');
      this.routeId = raw === null ? null : Number(raw);
      this.isEdit = this.routeId !== null;
      this.patchedRouteId = null;
      this.activeStep = 0;
      this.stepMessage = '';
    });

    effect(() => {
      if (!this.isEdit || this.routeId === null || this.patchedRouteId === this.routeId) return;
      const existing = this.store.routes().find(route => route.id === this.routeId);
      if (!existing) return;

      this.codePreview = existing.code;
      this.routeStatus = existing.status;
      this.form.patchValue({
        name: existing.name,
        departureTime: existing.departureTime || '07:30',
        shift: existing.shift,
      });
      this.stops.clear();
      existing.stops.forEach(stop => this.addStop(stop));
      this.legacyRouteWithoutStops = existing.stops.length === 0 && existing.stopsCount > 0;
      if (this.stops.length === 0) this.addStop();
      for (const row of this.serviceDays.controls) {
        const current = existing.schedule.find(item => item.dayOfWeek === row.controls.dayOfWeek.value);
        row.patchValue({
          enabled: current !== undefined,
          departureTime: current?.departureTime ?? (existing.departureTime || '07:30'),
        });
      }
      this.scheduleMessage = existing.scheduleConfirmed
        ? 'Horario recurrente confirmado en la configuración guardada.' : '';
      this.patchedRouteId = existing.id;
    });
  }

  private createServiceDay(day: RouteWeekday): DayForm {
    return this.fb.group({
      dayOfWeek: this.fb.nonNullable.control<RouteWeekday>(day),
      enabled: this.fb.nonNullable.control(false),
      departureTime: this.fb.nonNullable.control('07:30'),
    }, { validators: validateServiceDay });
  }

  get assignedCount(): number {
    return this.stops.controls.filter(stop => Boolean(stop.controls.studentId.value)).length;
  }

  async loadStudentCandidates(force = false): Promise<void> {
    if (this.studentsLoading() || (this.studentsLoaded() && !force)) return;
    this.studentsLoading.set(true);
    this.studentsError.set('');
    try {
      const candidates = await firstValueFrom(this.studentCatalog.getCandidates());
      this.students.set(candidates);
      this.studentsLoaded.set(true);
    } catch {
      this.studentsLoaded.set(false);
      this.studentsError.set('No se pudieron cargar los estudiantes. Intenta nuevamente.');
    } finally {
      this.studentsLoading.set(false);
    }
  }

  studentIsAvailable(id: string): boolean {
    return this.students().some(student => student.id === id);
  }

  availableStudents(index: number): RouteStudentOption[] {
    const current = this.stops.at(index).controls.studentId.value;
    const assignedElsewhere = new Set(this.stops.controls
      .filter((_, stopIndex) => stopIndex !== index)
      .map(stop => stop.controls.studentId.value)
      .filter(Boolean));
    return this.students().filter(student => !assignedElsewhere.has(student.id) || student.id === current);
  }

  studentNameFor(index: number): string {
    const studentId = this.stops.at(index).controls.studentId.value;
    if (!studentId) return 'Sin estudiante asignado';
    return this.students().find(student => student.id === studentId)?.fullName
      ?? 'Estudiante asignado (pendiente de verificar)';
  }

  private validAssignments(): boolean {
    const selectedIds = this.stops.controls.map(stop => stop.controls.studentId.value).filter(Boolean);
    if (new Set(selectedIds).size !== selectedIds.length) {
      this.assignmentMessage = 'Un estudiante no puede estar en dos paradas de la misma ruta y turno.';
      return false;
    }
    if (selectedIds.length > 0 && !this.studentsLoaded()) {
      this.assignmentMessage = 'Necesitas cargar los estudiantes antes de guardar estas asignaciones.';
      return false;
    }
    const authorizedIds = new Set(this.students().map(student => student.id));
    if (selectedIds.some(id => !authorizedIds.has(id))) {
      this.assignmentMessage = 'Hay una asignación que ya no está disponible. Revísala antes de continuar.';
      return false;
    }
    this.assignmentMessage = '';
    return true;
  }

  changeStudent(index: number): void {
    const control = this.stops.at(index).controls.studentId;
    const studentId = control.value;
    if (studentId && !this.students().some(student => student.id === studentId)) {
      control.setValue('');
    }
    this.assignmentMessage = '';
  }

  get selectedDaysCount(): number {
    return this.serviceDays.controls.filter(row => row.controls.enabled.value).length;
  }

  addStop(stop?: RouteStop): void {
    this.stops.push(this.fb.group({
      id: this.fb.nonNullable.control(stop?.id ?? crypto.randomUUID()),
      address: this.fb.nonNullable.control(stop?.address ?? '', [
        Validators.required, Validators.minLength(5),
      ]),
      studentId: this.fb.nonNullable.control(stop?.studentId ?? ''),
      studentName: this.fb.nonNullable.control(stop?.studentName ?? ''),
    }));
  }

  removeStop(index: number): void {
    if (this.stops.length > 1 && !this.saving) this.stops.removeAt(index);
  }

  moveStop(index: number, direction: -1 | 1): void {
    const next = index + direction;
    if (next < 0 || next >= this.stops.length || this.saving) return;
    const row = this.stops.at(index);
    this.stops.removeAt(index);
    this.stops.insert(next, row);
  }

  get isScheduleReady(): boolean {
    return isValidRouteSchedule(
      this.serviceDays.getRawValue()
        .filter(day => day.enabled)
        .map(day => ({ dayOfWeek: day.dayOfWeek, departureTime: day.departureTime })),
    );
  }

  get shiftLabel(): string {
    return this.form.controls.shift.value === 'MORNING' ? 'Mañana' : 'Tarde';
  }

  get previewFirstStop(): string {
    return this.stops.controls[0]?.controls.address.value.trim() || 'Por definir';
  }

  private validStep(step: number): boolean {
    if (step === 0) {
      const controls = this.form.controls;
      for (const field of [controls.name, controls.departureTime, controls.shift]) {
        field.markAsTouched();
      }
      return controls.name.valid && controls.departureTime.valid && controls.shift.valid;
    }
    if (step === 1) {
      this.stops.markAllAsTouched();
      return this.stops.length > 0 && this.stops.valid && this.validAssignments();
    }
    // El horario es opcional mientras la ruta se guarda como borrador.
    return true;
  }

  goToStep(step: number): void {
    if (this.saving || step < 0 || step > 3) return;
    this.stepMessage = '';
    if (step > this.activeStep) {
      for (let index = this.activeStep; index < step; index++) {
        if (!this.validStep(index)) {
          this.activeStep = index;
          this.stepMessage = index === 0
            ? 'Completa el nombre, la hora de salida y el turno.'
            : 'Revisa las paradas y las asignaciones.';
          return;
        }
      }
    }
    this.activeStep = step;
    if (step === 1) void this.loadStudentCandidates();
  }

  applySchoolWeek(): void {
    if (this.saving) return;
    const referenceTime = this.form.controls.departureTime.value;
    this.serviceDays.controls.forEach((row, index) => {
      row.controls.enabled.setValue(index < 5);
      if (!row.controls.departureTime.value) {
        row.controls.departureTime.setValue(referenceTime);
      }
    });
    this.stepMessage = '';
  }

  clearServiceDays(): void {
    if (this.saving) return;
    this.serviceDays.controls.forEach(row => row.controls.enabled.setValue(false));
  }

  private generateProvisionalCode(): string {
    return `RUT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  }

  async submit(confirmSchedule = false): Promise<void> {
    if (this.saving) return;
    this.scheduleMessage = '';
    this.stepMessage = '';
    if (this.form.invalid || !this.validAssignments()) {
      this.form.markAllAsTouched();
      this.stepMessage = this.assignmentMessage || 'Revisa los campos obligatorios antes de guardar.';
      this.activeStep = this.validStep(0) ? (this.validStep(1) ? 2 : 1) : 0;
      if (this.activeStep === 1) void this.loadStudentCandidates();
      return;
    }

    const values = this.form.getRawValue();
    const schedule: RouteSchedule[] = values.serviceDays
      .filter(day => day.enabled)
      .map(day => ({ dayOfWeek: day.dayOfWeek, departureTime: day.departureTime }));

    if (confirmSchedule && !isValidRouteSchedule(schedule)) {
      this.scheduleMessage = 'Selecciona un día de servicio y completa su hora de salida.';
      this.activeStep = 2;
      this.serviceDays.markAllAsTouched();
      return;
    }

    const current = this.store.routes().find(route => route.id === this.routeId);
    const scheduleUnchanged = current !== undefined &&
      JSON.stringify(current.schedule) === JSON.stringify(schedule);
    const route = new Route({
      id: this.routeId ?? 0,
      code: current?.code || this.generateProvisionalCode(),
      name: values.name.trim(),
      departureTime: values.departureTime,
      shift: values.shift,
      status: current?.status ?? 'CONFIGURABLE',
      stops: values.stops.map((stop, index) => ({
        id: stop.id,
        address: stop.address.trim(),
        position: index + 1,
        studentId: stop.studentId || null,
        // Los nombres pertenecen a Profiles; en la ruta se persiste solo la referencia.
        studentName: null,
      })),
      schedule,
      scheduleConfirmed: confirmSchedule || Boolean(current?.scheduleConfirmed && scheduleUnchanged),
    });

    this.saving = true;
    try {
      const success = this.isEdit
        ? await this.store.updateRoute(route)
        : await this.store.addRoute(route);
      if (success) await this.router.navigate(['/routes']);
    } finally {
      this.saving = false;
    }
  }

  cancel(): void { void this.router.navigate(['/routes']); }
}
