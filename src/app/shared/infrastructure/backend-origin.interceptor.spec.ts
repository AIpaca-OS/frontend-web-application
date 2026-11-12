import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { backendOriginInterceptor } from './backend-origin.interceptor';

describe('Spring Boot API origin', () => {
  beforeEach(() => {
    window.rumboConfig = { apiOrigin: 'https://rumbo-preview.example/' };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([backendOriginInterceptor])),
        provideHttpClientTesting(),
      ],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    delete window.rumboConfig;
  });

  it('uses the deployed backend for /api/v1/plans', () => {
    TestBed.inject(HttpClient).get('/api/v1/plans').subscribe();
    TestBed.inject(HttpTestingController)
      .expectOne('https://rumbo-preview.example/api/v1/plans').flush([]);
  });

  it('does not rewrite Angular assets or external provider calls', () => {
    const http = TestBed.inject(HttpClient);
    http.get('./assets/i18n/en.json').subscribe();
    http.get('https://example.org/notifications').subscribe();
    const ctrl = TestBed.inject(HttpTestingController);
    ctrl.expectOne('./assets/i18n/en.json').flush({});
    ctrl.expectOne('https://example.org/notifications').flush([]);
  });
});
