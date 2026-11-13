import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { VehiclesApiEndpoint } from './vehicles-api-endpoint';
import { environment } from '../../../environments/environment';
import { Vehicle } from '../domain/model/vehicle.entity';

describe('Vehicles REST API', () => {
  let endpoint: VehiclesApiEndpoint;
  let testing: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    endpoint = new VehiclesApiEndpoint(TestBed.inject(HttpClient));
    testing = TestBed.inject(HttpTestingController);
  });

  afterEach(() => testing.verify());

  const url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderVehiclesEndpointPath}`;

  it('loads the vehicles of the driver for the route selector', () => {
    let plate = '';
    endpoint.getByDriver(2).subscribe(vehicles => plate = vehicles[0].licensePlate);

    const request = testing.expectOne(`${url}?driverProfileId=2`);
    expect(request.request.method).toBe('GET');
    request.flush([{
      id: 1, brand: 'Toyota', model: 'Hiace', licensePlate: 'XYZ-789',
      capacity: 15, year: 2023, status: 'PENDING_VERIFICATION',
    }]);
    expect(plate).toBe('XYZ-789');
  });

  it('creates a vehicle and respects the pending verification status from the server', () => {
    const draft = new Vehicle({
      id: 0, brand: 'Toyota', model: 'Hiace', licensePlate: 'XYZ-789',
      capacity: 15, year: 2023, status: 'ACTIVE',
    });
    let savedStatus = '';
    endpoint.createForDriver(draft, 2).subscribe(vehicle => savedStatus = vehicle.status);

    const request = testing.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      driverProfileId: 2, brand: 'Toyota', model: 'Hiace', licensePlate: 'XYZ-789', capacity: 15, year: 2023,
    });
    request.flush({
      id: 1, brand: 'Toyota', model: 'Hiace', licensePlate: 'XYZ-789',
      capacity: 15, year: 2023, status: 'PENDING_VERIFICATION',
    });

    expect(savedStatus).toBe('PENDING_VERIFICATION');
  });

  it('updates only the fields accepted by UpdateVehicleRequest', () => {
    const vehicle = new Vehicle({
      id: 7, brand: 'Toyota', model: 'Hiace', licensePlate: 'XYZ-789', capacity: 15, year: 2023, status: 'VERIFIED',
    });
    endpoint.update(vehicle, 7).subscribe();
    const request = testing.expectOne(`${url}/7`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ brand: 'Toyota', model: 'Hiace', licensePlate: 'XYZ-789', capacity: 15, year: 2023 });
    request.flush({ id: 7, driverProfileId: 2, brand: 'Toyota', model: 'Hiace', licensePlate: 'XYZ-789', capacity: 15, year: 2023, status: 'VERIFIED' });
  });
});
