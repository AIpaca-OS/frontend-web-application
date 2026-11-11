import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DemoProfilesApi } from '../../identity-and-access-management/infrastructure/demo-profiles-api';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Vehicle } from '../domain/model/vehicle.entity';
import { VehicleResource, VehiclesResponse } from './vehicles-response';
import { VehicleAssembler } from './vehicle-assembler';

export class VehiclesApiEndpoint extends BaseApiEndpoint<
  Vehicle, VehicleResource, VehiclesResponse, VehicleAssembler
> {
  constructor(http: HttpClient, private readonly profiles: DemoProfilesApi) {
    super(http, environment.vehicleApiBaseUrl + environment.platformProviderVehiclesEndpointPath,
      new VehicleAssembler());
  }

  override getAll(): Observable<Vehicle[]> {
    return this.profiles.id('driver').pipe(
      switchMap(driverProfileId => this.http.get<VehicleResource[]>(this.endpointUrl, {
        params: { driverProfileId },
      })),
      map(rows => rows.map(row => this.assembler.toEntityFromResource(row))),
      catchError(this.handleError('Failed to fetch vehicles')),
    );
  }

  override create(vehicle: Vehicle): Observable<Vehicle> {
    const { brand, model, licensePlate, capacity, year } = vehicle;
    return this.profiles.id('driver').pipe(
      switchMap(driverProfileId => this.http.post<VehicleResource>(this.endpointUrl, {
        driverProfileId, brand, model, licensePlate, capacity, year,
      })),
      map(row => this.assembler.toEntityFromResource(row)),
      catchError(this.handleError('Failed to create vehicle')),
    );
  }

  override update(vehicle: Vehicle, id: number): Observable<Vehicle> {
    const { brand, model, licensePlate, capacity, year } = vehicle;
    return this.http.put<VehicleResource>(this.endpointUrl + '/' + id, {
      brand, model, licensePlate, capacity, year,
    }).pipe(
      map(row => this.assembler.toEntityFromResource(row)),
      catchError(this.handleError('Failed to update vehicle')),
    );
  }
}
