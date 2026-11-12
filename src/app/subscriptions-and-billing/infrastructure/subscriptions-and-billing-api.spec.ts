import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionsAndBillingApi } from './subscriptions-and-billing-api';

describe('Billing Spring Boot demo REST contract', () => {
  let api: SubscriptionsAndBillingApi;
  let http: HttpTestingController;

  beforeEach(() => {
    try { localStorage.removeItem('rumbo.billing.demo-session.v1'); } catch { /* no storage */ }
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(SubscriptionsAndBillingApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    try { localStorage.removeItem('rumbo.billing.demo-session.v1'); } catch { /* no storage */ }
  });

  function openSession(): void {
    const request = http.expectOne('/api/v1/billing-demo/session');
    expect(request.request.method).toBe('POST');
    request.flush({ token: 'test-personal-demo-token' });
  }

  it('gets public plans directly from Spring Boot', () => {
    api.getPlans().subscribe(plans => expect(plans[0].name).toBe('Premium'));
    http.expectOne('/api/v1/plans').flush([{
      id: 2, name: 'Premium', description: 'Mensual',
      referencePrice: 25, active: true,
    }]);
  });

  it('lists only the browser demo subscriptions via a signed session', () => {
    api.getSubscriptions().subscribe(rows => expect(rows).toEqual([]));
    openSession();
    const request = http.expectOne('/api/v1/billing-demo/subscriptions');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-personal-demo-token');
    request.flush([]);
  });

  it('activates a plan in Spring Boot without a caller-supplied driver ID', () => {
    const model = new Subscription({
      id: 0, driverId: '0', planId: '2', status: 'ACTIVE',
      startDate: '2026-11-12', paymentStatus: 'NOT_APPLICABLE', paymentAmount: 0,
    });
    api.createSubscription(model).subscribe(row => expect(row.id).toBe(4));
    openSession();
    const request = http.expectOne('/api/v1/billing-demo/subscriptions');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ planId: 2 });
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-personal-demo-token');
    request.flush({
      id: 4, driverId: 5000000000000, planId: 2, status: 'ACTIVE',
      startDate: '2026-11-12', endDate: null, active: true, vehicleLimit: null,
    });
  });

  it('cancels with PATCH using only this browser token', () => {
    api.deleteSubscription(4).subscribe();
    openSession();
    const request = http.expectOne('/api/v1/billing-demo/subscriptions/4/cancel');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-personal-demo-token');
    request.flush({
      id: 4, driverId: 5000000000000, planId: 2, status: 'CANCELLED',
      startDate: '2026-11-12', endDate: null, active: false, vehicleLimit: null,
    });
  });
});
