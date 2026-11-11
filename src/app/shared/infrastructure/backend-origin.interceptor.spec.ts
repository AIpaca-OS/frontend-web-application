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

  it('uses the configured origin for plans without appending a second API prefix', () => {
    TestBed.inject(HttpClient).get('/api/v1/plans', { params: { active: true } }).subscribe();
    TestBed.inject(HttpTestingController)
      .expectOne('https://rumbo-preview.example/api/v1/plans?active=true').flush([]);
  });

  it('keeps Angular assets on the site origin', () => {
    TestBed.inject(HttpClient).get('./assets/i18n/en.json').subscribe();
    TestBed.inject(HttpTestingController).expectOne('./assets/i18n/en.json').flush({});
  });
});
