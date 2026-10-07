import { Component, effect, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouteTripStore } from '../../../application/route-trip.store';
import { Route } from '../../../domain/model/route.entity';

@Component({
  selector: 'app-route-form',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './route-form.component.html',
  styleUrl: './route-form.component.css',
})
export class RouteFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(RouteTripStore);

  readonly form = this.fb.group({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    departureTime: new FormControl('07:30', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    stopsCount: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    status: new FormControl('ACTIVE', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  isEdit = false;
  routeId: number | null = null;
  private patchedRouteId: number | null = null;

  constructor() {
    this.activatedRoute.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.routeId = id ? Number(id) : null;
      this.isEdit = this.routeId !== null;
      this.patchedRouteId = null;
    });

    effect(() => {
      if (!this.isEdit || this.routeId === null || this.patchedRouteId === this.routeId) {
        return;
      }

      const currentRoute = this.store.routes().find((route) => route.id === this.routeId);
      if (!currentRoute) return;

      this.form.patchValue({
        code: currentRoute.code,
        name: currentRoute.name,
        departureTime: currentRoute.departureTime,
        stopsCount: currentRoute.stopsCount,
        status: currentRoute.status,
      });
      this.patchedRouteId = currentRoute.id;
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const route = new Route({
      id: this.routeId ?? 0,
      code: value.code,
      name: value.name,
      departureTime: value.departureTime,
      stopsCount: value.stopsCount,
      status: value.status.toUpperCase(),
    });

    if (this.isEdit) {
      this.store.updateRoute(route);
    } else {
      this.store.addRoute(route);
    }

    this.router.navigate(['/routes']);
  }

  cancel(): void {
    this.router.navigate(['/routes']);
  }
}
