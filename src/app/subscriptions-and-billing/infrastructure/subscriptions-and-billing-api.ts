import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BaseApi } from '../../shared/infrastructure/base-api';
import { Plan } from '../domain/model/plan.entity';
import { Subscription } from '../domain/model/subscription.entity';

import { PlansApiEndpoint } from './plans-api-endpoint';
import { SubscriptionsApiEndpoint } from './subscriptions-api-endpoint';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionsAndBillingApi extends BaseApi {
  private readonly http = inject(HttpClient);

  private readonly plansEndpoint = new PlansApiEndpoint(this.http);

  private readonly subscriptionsEndpoint = new SubscriptionsApiEndpoint(this.http);

  getPlans(): Observable<Plan[]> {
    return this.plansEndpoint.getAll();
  }

  getPlan(id: number): Observable<Plan> {
    return this.plansEndpoint.getById(id);
  }

  createPlan(plan: Plan): Observable<Plan> {
    return this.plansEndpoint.create(plan);
  }

  updatePlan(plan: Plan): Observable<Plan> {
    return this.plansEndpoint.update(plan, plan.id);
  }

  deletePlan(id: number): Observable<void> {
    return this.plansEndpoint.delete(id);
  }

  getSubscriptions(): Observable<Subscription[]> {
    return this.subscriptionsEndpoint.getAll();
  }

  getSubscription(id: number): Observable<Subscription> {
    return this.subscriptionsEndpoint.getById(id);
  }

  createSubscription(subscription: Subscription): Observable<Subscription> {
    return this.subscriptionsEndpoint.create(subscription);
  }

  updateSubscription(subscription: Subscription): Observable<Subscription> {
    return this.subscriptionsEndpoint.update(subscription, subscription.id);
  }

  deleteSubscription(id: number): Observable<void> {
    return this.subscriptionsEndpoint.delete(id);
  }
}
