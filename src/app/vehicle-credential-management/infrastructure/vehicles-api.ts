import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';
import { VehiclesApiEndpoint } from './vehicles-api-endpoint';
import { Vehicle } from '../domain/model/vehicle.entity';

/**
 * Infrastructure facade for the Vehicle & Credential Management bounded context.
 */
@Injectable({ providedIn: 'root' })
export class VehiclesApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(DemoRoleSession);
  private readonly vehiclesEndpoint = new VehiclesApiEndpoint(this.http);

  /**
   * Runs a request that needs the acting driver profile ID.
   * @param request - Request factory that receives the driver profile ID.
   * @returns Stream of the request, or an error stream with an i18n key.
   */
  private asDriver<T>(request: (driverProfileId: number) => Observable<T>): Observable<T> {
    const driverProfileId = this.session.role() === 'driver' ? this.session.profileId() : null;
    return driverProfileId ? request(driverProfileId) : throwError(() => new Error('errors.driverProfileRequired'));
  }

  /**
   * Retrieves the vehicles of the acting driver.
   * @returns Stream with the vehicle collection.
   */
  getVehicles = (): Observable<Vehicle[]> =>
    this.asDriver(driverProfileId => this.vehiclesEndpoint.getByDriver(driverProfileId));

  /**
   * Retrieves a vehicle by ID.
   * @param id - Vehicle identifier.
   * @returns Stream with the vehicle.
   */
  getVehicleById = (id: number): Observable<Vehicle> => this.vehiclesEndpoint.getById(id);

  /**
   * Registers a vehicle for the acting driver.
   * @param vehicle - Vehicle to register.
   * @returns Stream with the created vehicle.
   */
  createVehicle = (vehicle: Vehicle): Observable<Vehicle> =>
    this.asDriver(driverProfileId => this.vehiclesEndpoint.createForDriver(vehicle, driverProfileId));

  /**
   * Updates a vehicle.
   * @param vehicle - Vehicle to update.
   * @returns Stream with the updated vehicle.
   */
  updateVehicle = (vehicle: Vehicle): Observable<Vehicle> => this.vehiclesEndpoint.update(vehicle, vehicle.id);

  /**
   * Deletes a vehicle.
   * @param id - Vehicle identifier.
   * @returns Completion stream.
   */
  deleteVehicle = (id: number): Observable<void> => this.vehiclesEndpoint.delete(id);
}
