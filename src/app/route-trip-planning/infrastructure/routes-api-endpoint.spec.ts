import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Route } from '../domain/model/route.entity';
import { RoutesApiEndpoint } from './routes-api-endpoint';
import { ApiError } from '../../shared/infrastructure/api-error';

describe('RoutesApiEndpoint (Spring Boot Long IDs)', () => {
  let endpoint: RoutesApiEndpoint;
  let testing: HttpTestingController;
  const base = `${environment.platformProviderApiBaseUrl}${environment.platformProviderRoutesEndpointPath}`;
  const routeResource = (status: string) => ({
    id: 15, driverProfileId: 2, name: 'Ruta Surco', code: 'R-SURCO', shift: 'MORNING', departureTime: '07:00', status,
    vehicleId: 1, stopsCount: 1, stops: [{ id: 10, address: 'Av. Primavera 123', position: 1, studentIds: [5] }],
    schedule: [{ dayOfWeek: 'MONDAY', departureTime: '07:00' }], scheduleConfirmed: true,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    endpoint = new RoutesApiEndpoint(TestBed.inject(HttpClient));
    testing = TestBed.inject(HttpTestingController);
  });
  afterEach(() => testing.verify());

  it('loads the routes of a driver', () => {
    let count = 0;
    endpoint.getByDriver(2).subscribe(routes => count = routes.length);
    testing.expectOne(`${base}?driverProfileId=2`).flush([routeResource('CONFIGURABLE')]);
    expect(count).toBe(1);
  });

  it('publishes a route with PATCH /status', () => {
    let result: Route | undefined;
    endpoint.publish('15').subscribe(route => result = route);
    const request = testing.expectOne(`${base}/15/status`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'PUBLISHED' });
    request.flush(routeResource('PUBLISHED'));
    expect(result?.id).toBe('15');
    expect(result?.status).toBe('PUBLISHED');
  });

  it('replaces assignments with numeric IDs and maps the returned route', () => {
    let result: Route | undefined;
    endpoint.replaceAssignments('15', [{ stopId: 10, studentId: 5 }]).subscribe(route => result = route);
    const request = testing.expectOne(`${base}/15/assignments`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual([{ stopId: 10, studentId: 5 }]);
    request.flush(routeResource('CONFIGURABLE'));
    expect(result?.stops[0].studentId).toBe('5');
  });

  it('reports CORS/network failures as status 0', () => {
    let failure: unknown;
    endpoint.getById('15').subscribe({ error: error => failure = error });
    testing.expectOne(`${base}/15`).error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    expect((failure as ApiError).status).toBe(0);
  });
});
