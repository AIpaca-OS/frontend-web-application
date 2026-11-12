import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';
import { RouteForTrip, TripsApi } from './trips-api';

describe('TripsApi', () => {
  let api: TripsApi;
  let http: HttpTestingController;
  let session: DemoRoleSession;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient(), provideHttpClientTesting()]});
    api = TestBed.inject(TripsApi);
    http = TestBed.inject(HttpTestingController);
    session = TestBed.inject(DemoRoleSession);
    session.enter('driver', 2);
  });
  afterEach(() => { http.verify(); session.leave(); });

  it('posts a published route snapshot to the real Trips endpoint', () => {
    const route: RouteForTrip = {
      id: 8, driverProfileId: 2, vehicleId: 5, name: 'Ruta tarde', code: 'R-8',
      status: 'PUBLISHED', shift: 'AFTERNOON', schedule: [],
      stops: [{id: 9, address: 'Av. Demo 10', position: 1, studentIds: [4]}],
    };
    api.plan(route, '2026-11-16').subscribe();
    const request = http.expectOne('/api/v1/trips');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      routeId: 8, driverProfileId: 2, vehicleId: 5, date: '2026-11-16',
      shift: 'AFTERNOON', passengers: [{studentId: 4, stopId: 9,
        stopPosition: 1, stopAddress: 'Av. Demo 10'}],
    });
    request.flush({id: 12, routeId: 8, serviceDate: '2026-11-16', status: 'SCHEDULED', students: []});
  });
});
