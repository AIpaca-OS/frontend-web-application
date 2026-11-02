import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Route } from '../domain/model/route.entity';
import { RoutesApiEndpoint } from './routes-api-endpoint';

describe('RoutesApiEndpoint', () => {
  let endpoint: RoutesApiEndpoint;
  let httpTesting: HttpTestingController;
  const originalEnvironment = {
    baseUrl: environment.routePlanningApiBaseUrl,
    mode: environment.routePlanningApiMode,
  };

  beforeEach(() => {
    environment.routePlanningApiBaseUrl = 'http://localhost:8080/api/v1';
    environment.routePlanningApiMode = 'backend';

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    endpoint = new RoutesApiEndpoint(TestBed.inject(HttpClient), () => 'es-419');
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    environment.routePlanningApiBaseUrl = originalEnvironment.baseUrl;
    environment.routePlanningApiMode = originalEnvironment.mode;
  });

  it('sends a localized PATCH to publish a route', () => {
    const id = 'f36da68a-4343-4717-97ab-00e821b76522';
    let received: Route | undefined;

    endpoint.publish(id).subscribe(route => (received = route));

    const request = httpTesting.expectOne(
      'http://localhost:8080/api/v1/routes/' + id + '/status',
    );
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'PUBLISHED' });
    expect(request.request.headers.get('Accept-Language')).toBe('es-419');

    request.flush({
      id,
      code: 'RUT-000001',
      name: 'Morning Route',
      shift: 'MORNING',
      departureTime: '07:00',
      status: 'PUBLISHED',
      stops: [{ id: 'c87c45d4-a049-47a0-8a16-e34919c28b13', address: 'Main Street 10', position: 1 }],
      schedule: [{ dayOfWeek: 'MONDAY', departureTime: '07:00' }],
      scheduleConfirmed: true,
    });

    expect(received?.id).toBe(id);
    expect(received?.status).toBe('PUBLISHED');
  });
});
