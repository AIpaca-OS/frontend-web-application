import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionsAndBillingApi } from './subscriptions-and-billing-api';

describe('Billing Spring Boot REST contract', () => {
  let api: SubscriptionsAndBillingApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(SubscriptionsAndBillingApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads plans from Spring Boot instead of MockAPI', () => {
    api.getPlans().subscribe(plans => expect(plans[0].name).toBe('Premium'));
    http.expectOne('/api/v1/plans').flush([{
      id: 2, name: 'Premium', description: 'Mensual',
      referencePrice: 25, active: true,
    }]);
  });

  it('lists subscriptions for the demo driver through Spring Boot', () => {
    api.getSubscriptions().subscribe(rows => expect(rows.length).toBe(0));
    http.expectOne('/api/v1/subscriptions?driverId=1').flush([]);
  });

  it('activates subscriptions using the backend driver/plan contract', () => {
    const subscription = new Subscription({
      id: 0, driverId: '1', planId: '2', status: 'ACTIVE',
      startDate: '2026-11-12', paymentStatus: 'NOT_APPLICABLE', paymentAmount: 0,
    });
    api.createSubscription(subscription).subscribe(row => expect(row.id).toBe(4));
    const request = http.expectOne('/api/v1/subscriptions');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ driverId: 1, planId: 2 });
    request.flush({
      id: 4, driverId: 1, planId: 2, status: 'ACTIVE',
      startDate: '2026-11-12', endDate: null, active: true, vehicleLimit: null,
    });
  });

  it('cancels via PATCH instead of MockAPI DELETE', () => {
    api.deleteSubscription(4).subscribe();
    const request = http.expectOne('/api/v1/subscriptions/4/cancel');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ driverId: 1 });
    request.flush({
      id: 4, driverId: 1, planId: 2, status: 'CANCELLED',
      startDate: '2026-11-12', endDate: null, active: false, vehicleLimit: null,
    });
  });
});
