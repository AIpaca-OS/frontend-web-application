import { Component, effect, inject } from '@angular/core';
import {
  FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouteTripStore } from '../../../application/route-trip.store';
import { Route, RouteShift } from '../../../domain/model/route.entity';
import { RouteStop } from '../../../domain/model/route-stop.entity';

type StopForm = FormGroup<{
  id: FormControl<string>;
  address: FormControl<string>;
  studentId: FormControl<string>;
  studentName: FormControl<string>;
}>;

@Component({
  selector: 'app-route-form',
  standalone: true,
  imports: [
    MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatSelectModule, ReactiveFormsModule,
  ],
  templateUrl: './route-form.component.html',
  styleUrl: './route-form.component.css',
})
export class RouteFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(RouteTripStore);

  readonly stops = new FormArray<StopForm>([], { validators: Validators.minLength(1) });
  readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    departureTime: this.fb.nonNullable.control('07:30', Validators.required),
    shift: this.fb.nonNullable.control<RouteShift>('MORNING', Validators.required),
    stops: this.stops,
  });

  isEdit = false;
  routeId: number | null = null;
  codePreview = '';
  routeStatus = 'CONFIGURABLE';
  saving = false;
  legacyRouteWithoutStops = false;
  private patchedRouteId: number | null = null;

  constructor() {
    this.addStop();
    this.activatedRoute.paramMap.subscribe(params => {
      const raw = params.get('id');
      this.routeId = raw === null ? null : Number(raw);
      this.isEdit = this.routeId !== null;
      this.patchedRouteId = null;
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
      this.patchedRouteId = existing.id;
    });
  }

  get assignedCount(): number {
    return this.stops.controls.filter(stop => Boolean(stop.controls.studentId.value)).length;
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

  /**
   * Solo para MockAPI: el backend definitivo deberá asignar el código único.
   * No depende del número de registros para evitar colisiones por concurrencia.
   */
  private generateProvisionalCode(): string {
    return `RUT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  }

  async submit(): Promise<void> {
    if (this.saving) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const current = this.store.routes().find(route => route.id === this.routeId);
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
        studentName: stop.studentName || null,
      })),
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
