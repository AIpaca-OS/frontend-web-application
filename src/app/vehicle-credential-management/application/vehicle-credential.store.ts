import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { VehiclesApi } from '../infrastructure/vehicles-api';
import { Vehicle } from '../domain/model/vehicle.entity';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { retry } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VehicleCredentialStore {
  private readonly vehiclesApi = inject(VehiclesApi);

  private readonly vehiclesSignal = signal<Vehicle[]>([]);
  readonly vehicles = this.vehiclesSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  readonly vehicleCount = computed(() => this.vehicles().length);

  constructor() {
    this.loadVehicles();
  }

  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found')
        ? `${fallback}: Not found`
        : error.message;
    }
    return fallback;
  }

  loadVehicles(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.vehiclesApi
      .getVehicles()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (vehicles) => {
          this.vehiclesSignal.set(vehicles);
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to load vehicles'));
          this.loadingSignal.set(false);
        },
      });
  }

  getVehicleById(id: number): Signal<Vehicle | undefined> {
    return computed(() => (id ? this.vehicles().find((v) => v.id === id) : undefined));
  }

  addVehicle(vehicle: Vehicle): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.vehiclesApi
      .createVehicle(vehicle)
      .pipe(retry(2))
      .subscribe({
        next: (created) => {
          this.vehiclesSignal.update((list) => [...list, created]);
          this.loadingSignal.set(false);
        },
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to create vehicle'));
          this.loadingSignal.set(false);
        },
      });
  }

  updateVehicle(vehicle: Vehicle): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.vehiclesApi
      .updateVehicle(vehicle)
      .pipe(retry(2))
      .subscribe({
        next: (updated) => {
          this.vehiclesSignal.update((list) =>
            list.map((v) => (v.id === updated.id ? updated : v)),
          );
          this.loadingSignal.set(false);
        },
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to update vehicle'));
          this.loadingSignal.set(false);
        },
      });
  }

  deleteVehicle(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.vehiclesApi
      .deleteVehicle(id)
      .pipe(retry(2))
      .subscribe({
        next: () => {
          this.vehiclesSignal.update((list) => list.filter((v) => v.id !== id));
          this.loadingSignal.set(false);
        },
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to delete vehicle'));
          this.loadingSignal.set(false);
        },
      });
  }
}
