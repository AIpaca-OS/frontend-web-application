import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ServiceEnrollmentsApi } from './service-enrollments-api';

describe('Profiles enrollment contract', () => {
  let api: ServiceEnrollmentsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ServiceEnrollmentsApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('includes the tutor profile when requesting enrollment', () => {
    api.request(8, 7).subscribe();
    http.expectOne('/api/v1/profiles/by-account/10001').flush({ id: 4 });
    const request = http.expectOne('/api/v1/service-enrollments');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ studentId: 8, driverProfileId: 7, requestedByProfileId: 4 });
    request.flush({ id: 2, status: 'PENDING' });
  });

  it('passes the driver profile as a query parameter when accepting', () => {
    api.accept(2).subscribe();
    http.expectOne('/api/v1/profiles/by-account/10002').flush({ id: 7 });
    const request = http.expectOne('/api/v1/service-enrollments/2/accept?driverProfileId=7');
    expect(request.request.method).toBe('POST');
    request.flush({ id: 2, status: 'ACCEPTED' });
  });
});
