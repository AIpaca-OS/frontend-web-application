import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DriverDemoNoticesApi } from './driver-demo-notices-api';

describe('DriverDemoNoticesApi', () => {
  let api: DriverDemoNoticesApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(DriverDemoNoticesApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('reports a delay against a specific trip with the resolved driver profile', () => {
    api.send(12, 'DELAY', 'Heavy traffic', 20).subscribe();
    http.expectOne('/api/v1/profiles/by-account/10002').flush({ id: 7 });
    const request = http.expectOne('/api/v1/delays');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      tripId: 12, reportedByProfileId: 7, cause: 'Heavy traffic', estimatedMinutes: 20,
    });
    request.flush({ id: 1 });
  });

  it('reports an incident through the Incidents bounded context', () => {
    api.send(12, 'INCIDENT', 'Road obstructed', 0).subscribe();
    http.expectOne('/api/v1/profiles/by-account/10002').flush({ id: 7 });
    const request = http.expectOne('/api/v1/incidents');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      tripId: 12, reportedByProfileId: 7, category: 'OTHER', description: 'Road obstructed',
    });
    request.flush({ id: 1 });
  });
});
