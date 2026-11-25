import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Vehicle } from '../domain/model/vehicle.entity';
import { VehicleAssembler } from './vehicle-assembler';
import { VehicleResource, VehiclesResponse } from './vehicles-response';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';

export class VehiclesApiEndpoint extends BaseApiEndpoint<
  Vehicle, VehicleResource, VehiclesResponse, VehicleAssembler
> {
  constructor(http: HttpClient, private readonly session?: DemoRoleSession) {
    super(http, `${environment.vehicleApiBaseUrl}${environment.platformProviderVehiclesEndpointPath}`, new VehicleAssembler());
  }

  override getAll(): Observable<Vehicle[]> {
    if (!this.session) return super.getAll(); // compatibilidad para tests antiguos
    const driverId = this.session.requireProfileId('driver');
    return this.http.get<VehicleResource[]>(this.endpointUrl + '?driverProfileId=' + driverId)
      .pipe(map(rows => rows.map(resource => this.assembler.toEntityFromResource(resource))));
  }

  override create(vehicle: Vehicle): Observable<Vehicle> {
    if (!this.session) return super.create(vehicle); // compatibilidad para tests antiguos
    const body = {
      driverProfileId: this.session.requireProfileId('driver'),
      brand: vehicle.brand, model: vehicle.model,
      licensePlate: vehicle.licensePlate, capacity: vehicle.capacity, year: vehicle.year,
    };
    return this.http.post<VehicleResource>(this.endpointUrl, body)
      .pipe(map(resource => this.assembler.toEntityFromResource(resource)));
  }

  override update(vehicle: Vehicle, id: number): Observable<Vehicle> {
    this.session?.requireProfileId('driver');
    const body = {
      brand: vehicle.brand, model: vehicle.model,
      licensePlate: vehicle.licensePlate, capacity: vehicle.capacity, year: vehicle.year,
    };
    return this.http.put<VehicleResource>(this.endpointUrl + '/' + id, body)
      .pipe(map(resource => this.assembler.toEntityFromResource(resource)));
  }
}
