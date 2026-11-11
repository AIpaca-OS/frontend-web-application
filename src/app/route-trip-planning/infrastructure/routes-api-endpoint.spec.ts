import { DemoProfilesApi } from '../../identity-and-access-management/infrastructure/demo-profiles-api';
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

    endpoint = new RoutesApiEndpoint(TestBed.inject(HttpClient), () => 'es-419', TestBed.inject(DemoProfilesApi));
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    environment.routePlanningApiBaseUrl = originalEnvironment.baseUrl;
    environment.routePlanningApiMode = originalEnvironment.mode;
  });

  it('sends a localized PATCH to publish a route', () => {
    const id = '42';
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
      stops: [{ id: '14', address: 'Main Street 10', position: 1 }],
      schedule: [{ dayOfWeek: 'MONDAY', departureTime: '07:00' }],
      scheduleConfirmed: true,
    });

    expect(received?.id).toBe(id);
    expect(received?.status).toBe('PUBLISHED');
  });
  it('loads only eligible student candidates from Routes backend', () => {
    let candidates: { id: string; fullName: string }[] = [];
    endpoint.getEligibleStudents().subscribe(rows => (candidates = rows));

    httpTesting.expectOne('/api/v1/profiles/by-account/10002').flush({ id: 7 });
    const request = httpTesting.expectOne('/api/v1/service-enrollments/drivers/7/students');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Accept-Language')).toBe('es-419');
    request.flush([{ id: 21, firstName: 'Example', lastName: 'Student' }]);

    expect(candidates.length).toBe(1);
    expect(candidates[0].id).toBe('21');
  });

  it('sends selected student assignments as one REST request', () => {
    const id = '42';
    const stopId = '14';
    let result: Route | undefined;
    endpoint.replaceAssignments(id, [{ stopId, studentId: '21' }])
      .subscribe(route => (result = route));

    const request = httpTesting.expectOne(
      'http://localhost:8080/api/v1/routes/' + id + '/assignments',
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual([{ stopId: 14, studentId: 21 }]);
    request.flush({
      id,
      name: 'Morning Route',
      code: 'R-12345678',
      status: 'CONFIGURABLE',
      shift: 'MORNING',
      vehicleId: 16,
      stops: [{
        id: 14, position: 1, address: 'Av. Primavera 123', studentIds: [21, 22],
      }],
      schedule: [{ dayOfWeek: 'MONDAY', departureTime: '07:00' }],
      scheduleConfirmed: true,
    });
    expect(result?.stops[0].studentId).toBe('21');
    expect(result?.stops[0].additionalStudentIds).toEqual(['22']);
    expect(result?.vehicleId).toBe('16');
  });

});
