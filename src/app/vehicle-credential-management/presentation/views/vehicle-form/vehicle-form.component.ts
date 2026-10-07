import { Component, inject } from '@angular/core';
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
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatIconModule, MatCardModule],
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
  vehicleId: number | null = null;

  constructor() {
    this.route.params.subscribe((params) => {
      this.vehicleId = params['id'] ? +params['id'] : null;
      this.isEdit = !!this.vehicleId;
      if (this.isEdit && this.vehicleId) {
        const vehicle = this.store.getVehicleById(this.vehicleId)();
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

  submit(): void {
    if (this.form.invalid) return;

    const vehicle = new Vehicle({
      id: this.vehicleId ?? 0,
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
