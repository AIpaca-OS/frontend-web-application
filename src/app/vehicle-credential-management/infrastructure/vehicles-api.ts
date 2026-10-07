import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { VehiclesApiEndpoint } from './vehicles-api-endpoint';
import { Vehicle } from '../domain/model/vehicle.entity';

@Injectable({
  providedIn: 'root',
})
export class VehiclesApi extends BaseApi {
  private readonly endpoint: VehiclesApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.endpoint = new VehiclesApiEndpoint(http);
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.endpoint.getAll();
  }

  getVehicleById(id: number): Observable<Vehicle> {
    return this.endpoint.getById(id);
  }

  createVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.endpoint.create(vehicle);
  }

  updateVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.endpoint.update(vehicle, vehicle.id);
  }

  deleteVehicle(id: number): Observable<void> {
    return this.endpoint.delete(id);
  }
}
