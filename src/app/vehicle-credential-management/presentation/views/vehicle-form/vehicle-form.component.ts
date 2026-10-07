import { Component,effect, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleCredentialStore } from '../../../application/vehicle-credential.store';
import { Vehicle } from '../../../domain/model/vehicle.entity';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.css',
})
export class VehicleFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(VehicleCredentialStore);

  form = this.fb.group({
    brand: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    model: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    licensePlate: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    capacity: new FormControl<number>(15, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    year: new FormControl<number>(2024, { nonNullable: true, validators: [Validators.required] }),
  });

  isEdit = false;
  vehicleId: string | number | null = null;

  constructor() {
    if (this.store.vehicles().length === 0) {
      this.store.loadVehicles();
    }

    this.route.params.subscribe((params) => {
      const idParam = params['id'];
      if (idParam && idParam !== 'NaN' && idParam !== 'null') {
        this.vehicleId = idParam;
        this.isEdit = true;
      } else {
        this.vehicleId = null;
        this.isEdit = false;
      }
    });

    effect(() => {
      if (this.isEdit && this.vehicleId) {
        const vehicle = this.store
          .vehicles()
          .find((v: any) => String(v.id) === String(this.vehicleId));

        if (vehicle) {
          this.form.patchValue({
            brand: (vehicle as any).brand ?? (vehicle as any)._brand ?? '',
            model: (vehicle as any).model ?? (vehicle as any)._model ?? '',
            licensePlate:
              (vehicle as any).licensePlate ??
              (vehicle as any)._licensePlate ??
              (vehicle as any).plate ??
              '',
            capacity: Number((vehicle as any).capacity ?? (vehicle as any)._capacity ?? 15),
            year: Number((vehicle as any).year ?? (vehicle as any)._year ?? 2024),
          });
        }
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    const vehicle = new Vehicle({
      id: Number(this.vehicleId ?? 0),
      brand: this.form.value.brand!,
      model: this.form.value.model!,
      licensePlate: this.form.value.licensePlate!,
      capacity: this.form.value.capacity!,
      year: this.form.value.year!,
      status: 'ACTIVE',
    });

    if (this.isEdit) {
      this.store.updateVehicle(vehicle);
    } else {
      this.store.addVehicle(vehicle);
    }

    this.router.navigate(['vehicles']);
  }

  cancel(): void {
    this.router.navigate(['vehicles']);
  }
}
