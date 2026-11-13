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
import { TranslatePipe } from '@ngx-translate/core';

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
    TranslatePipe,
  ],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.css',
})
export class VehicleFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(VehicleCredentialStore);
  readonly saving = this.store.loading;
  readonly error = this.store.error;

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
          .find(current => String(current.id) === String(this.vehicleId));

        if (vehicle) {
          this.form.patchValue({
            brand: vehicle.brand,
            model: vehicle.model,
            licensePlate: vehicle.licensePlate,
            capacity: vehicle.capacity,
            year: vehicle.year,
          });
        }
      }
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;

    const current = this.store.vehicles().find(item => String(item.id) === String(this.vehicleId));
    const vehicle = new Vehicle({
      id: Number(this.vehicleId ?? 0),
      brand: this.form.value.brand!,
      model: this.form.value.model!,
      licensePlate: this.form.value.licensePlate!,
      capacity: this.form.value.capacity!,
      year: this.form.value.year!,
      // Verification status is assigned by the backend.
      status: current?.status ?? 'PENDING_VERIFICATION',
    });

    const saved = this.isEdit
      ? await this.store.updateVehicle(vehicle)
      : await this.store.addVehicle(vehicle);

    if (saved) await this.router.navigate(['/driver/vehicles']);
  }

  cancel(): void {
    this.router.navigate(['/driver/vehicles']);
  }
}
