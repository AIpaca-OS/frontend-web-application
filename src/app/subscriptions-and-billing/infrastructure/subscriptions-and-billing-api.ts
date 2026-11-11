import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlansApiEndpoint } from './plans-api-endpoint';
import { SubscriptionsApiEndpoint } from './subscriptions-api-endpoint';

@Injectable({ providedIn: 'root' })
export class SubscriptionsAndBillingApi {
  private readonly http = inject(HttpClient);
  private readonly plansEndpoint = new PlansApiEndpoint(this.http);
  private readonly subscriptionsEndpoint = new SubscriptionsApiEndpoint(this.http);

  getPlans() {
    return this.plansEndpoint.getAll();
  }

  getPlan(id: number) {
    return this.plansEndpoint.getById(id);
  }

  getSubscriptions(driverId: number) {
    return this.subscriptionsEndpoint.getByDriverId(driverId);
  }

  activateSubscription(driverId: number, planId: number) {
    return this.subscriptionsEndpoint.activate(driverId, planId);
  }
}
