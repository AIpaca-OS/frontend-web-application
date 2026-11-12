import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { VehiclesApiEndpoint } from './vehicles-api-endpoint';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';
import { Vehicle } from '../domain/model/vehicle.entity';

describe('Vehicles REST API', () => {
  let endpoint: VehiclesApiEndpoint;
  let testing: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const session = TestBed.inject(DemoRoleSession);
    session.enter('driver', 2);
    endpoint = new VehiclesApiEndpoint(TestBed.inject(HttpClient), session);
    testing = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    testing.verify();
    sessionStorage.removeItem('rumbo.preview.role');
    sessionStorage.removeItem('rumbo.preview.profileId');
  });

  it('loads the persisted vehicle catalog for the route selector', () => {
    let plate = '';
    endpoint.getAll().subscribe(vehicles => plate = vehicles[0].licensePlate);

    const request = testing.expectOne('/api/v1/vehicles?driverProfileId=2');
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
    endpoint.create(draft).subscribe(vehicle => savedStatus = vehicle.status);

    const request = testing.expectOne('/api/v1/vehicles');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.licensePlate).toBe('XYZ-789');
    expect(request.request.body.driverProfileId).toBe(2);
    request.flush({
      id: 1, brand: 'Toyota', model: 'Hiace', licensePlate: 'XYZ-789',
      capacity: 15, year: 2023, status: 'PENDING_VERIFICATION',
    });

    expect(savedStatus).toBe('PENDING_VERIFICATION');
  });
});
