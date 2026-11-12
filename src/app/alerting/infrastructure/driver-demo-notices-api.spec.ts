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

  it('sends a delay only through a specific route endpoint', () => {
    const routeId = '09fab5eb-16af-43c7-8907-81ae328ce152';
    let title = '';
    api.send(routeId, 'DELAY', 'Heavy traffic').subscribe(r => title = r.title);

    const request = http.expectOne('/api/v1/routes/' + routeId + '/notices');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ kind: 'DELAY', message: 'Heavy traffic' });
    request.flush({ id: 12, title: 'Retraso comunicado', message: 'Heavy traffic' });
    expect(title).toContain('Retraso');
  });
});
