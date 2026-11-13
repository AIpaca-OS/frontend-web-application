import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Vehicle } from '../domain/model/vehicle.entity';
import { VehicleResource, VehiclesResponse } from './vehicles-response';
import { VehicleAssembler } from './vehicle-assembler';
import { environment } from '../../../environments/environment';

/**
 * Endpoint client for the Vehicles resource.
 *
 * @remarks
 * Supported operations (Swagger): GET /vehicles?driverProfileId, GET/PUT/DELETE /vehicles/{id} and POST /vehicles.
 */
export class VehiclesApiEndpoint extends BaseApiEndpoint<Vehicle, VehicleResource, VehiclesResponse, VehicleAssembler> {
  /**
   * Creates an instance of VehiclesApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderVehiclesEndpointPath}`, new VehicleAssembler());
  }

  /**
   * Fetches the vehicles of a driver.
   * @param driverProfileId - Driver profile identifier.
   * @returns Stream with the mapped vehicles.
   */
  getByDriver(driverProfileId: number): Observable<Vehicle[]> {
    return this.http.get<VehicleResource[]>(this.endpointUrl, { params: { driverProfileId } }).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to fetch vehicles'))
    );
  }

  /**
   * Registers a vehicle for a driver.
   * @param vehicle - Vehicle to register.
   * @param driverProfileId - Owner driver profile.
   * @returns Stream with the created vehicle.
   */
  createForDriver(vehicle: Vehicle, driverProfileId: number): Observable<Vehicle> {
    return this.http.post<VehicleResource>(this.endpointUrl, this.assembler.toCreateResourceFromEntity(vehicle, driverProfileId)).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create vehicle'))
    );
  }

  /**
   * Updates a vehicle with the fields accepted by UpdateVehicleRequest.
   * @param vehicle - Vehicle state to persist.
   * @param id - Vehicle identifier.
   * @returns Stream with the updated vehicle.
   */
  override update(vehicle: Vehicle, id: number): Observable<Vehicle> {
    return this.http.put<VehicleResource>(`${this.endpointUrl}/${id}`, this.assembler.toUpdateResourceFromEntity(vehicle)).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to update vehicle'))
    );
  }
}
