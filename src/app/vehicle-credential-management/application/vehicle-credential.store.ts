import { computed, DestroyRef, inject, Injectable, signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { VehiclesApi } from '../infrastructure/vehicles-api';
import { Vehicle } from '../domain/model/vehicle.entity';
import { toErrorMessageKey } from '../../shared/infrastructure/api-error';

/**
 * Holds Vehicle & Credential Management application state and coordinates vehicle operations.
 *
 * @remarks
 * `error` contains an i18n key that the views render with TranslatePipe.
 */
@Injectable({
  providedIn: 'root',
})
export class VehicleCredentialStore {
  private readonly vehiclesApi = inject(VehiclesApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly vehiclesSignal = signal<Vehicle[]>([]);

  /**
   * Readonly signal for the vehicles of the acting driver.
   */
  readonly vehicles = this.vehiclesSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);

  /**
   * Readonly signal indicating if data is loading.
   */
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);

  /**
   * Readonly signal for the current error (i18n key).
   */
  readonly error = this.errorSignal.asReadonly();

  /**
   * Computed signal for the count of vehicles.
   */
  readonly vehicleCount = computed(() => this.vehicles().length);

  /**
   * Creates an instance of VehicleCredentialStore and loads initial data.
   */
  constructor() {
    this.loadVehicles();
  }

  /**
   * Loads the vehicles of the acting driver.
   */
  loadVehicles = (): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.vehiclesApi.getVehicles().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: vehicles => {
        this.vehiclesSignal.set(vehicles);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'errors.loadVehicles'));
        this.loadingSignal.set(false);
      }
    });
  };

  /**
   * Selects a vehicle by identifier.
   * @param id - Vehicle identifier.
   * @returns Reactive selection for the requested vehicle.
   */
  getVehicleById = (id: number): Signal<Vehicle | undefined> =>
    computed(() => (id ? this.vehicles().find(vehicle => vehicle.id === id) : undefined));

  /**
   * Registers a vehicle.
   * @param vehicle - Vehicle to register.
   * @returns True when the vehicle was created.
   */
  addVehicle = async (vehicle: Vehicle): Promise<boolean> => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      // A POST must not be retried automatically: it may have been persisted already.
      const created = await firstValueFrom(this.vehiclesApi.createVehicle(vehicle));
      this.vehiclesSignal.update(vehicles => [...vehicles, created]);
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'errors.createVehicle'));
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  };

  /**
   * Updates a vehicle.
   * @param vehicle - Vehicle to update.
   * @returns True when the vehicle was updated.
   */
  updateVehicle = async (vehicle: Vehicle): Promise<boolean> => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const updated = await firstValueFrom(this.vehiclesApi.updateVehicle(vehicle));
      this.vehiclesSignal.update(vehicles => vehicles.map(current => current.id === updated.id ? updated : current));
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'errors.updateVehicle'));
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  };

  /**
   * Deletes a vehicle.
   * @param id - Vehicle identifier.
   */
  deleteVehicle = (id: number): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.vehiclesApi.deleteVehicle(id).subscribe({
      next: () => {
        this.vehiclesSignal.update(vehicles => vehicles.filter(vehicle => vehicle.id !== id));
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'errors.deleteVehicle'));
        this.loadingSignal.set(false);
      }
    });
  };

  /**
   * Normalizes unknown errors into an i18n key.
   * @param error - Source error.
   * @param fallback - Key used when the error carries no HTTP information.
   * @returns Translation key.
   */
  private formatError = (error: unknown, fallback: string): string => toErrorMessageKey(error, fallback);
}
