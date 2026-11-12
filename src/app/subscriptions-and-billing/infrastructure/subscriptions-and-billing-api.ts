import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Plan } from '../domain/model/plan.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { PlansApiEndpoint } from './plans-api-endpoint';
import { SubscriptionsApiEndpoint } from './subscriptions-api-endpoint';

interface BackendSubscription {
  id: number;
  driverId: number;
  planId: number;
  status: string;
  startDate: string;
  endDate: string;
  active: boolean;
  vehicleLimit: number | null;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionsAndBillingApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly plansEndpoint = new PlansApiEndpoint(this.http);
  private readonly subscriptionsEndpoint = new SubscriptionsApiEndpoint(this.http);
  private readonly backendMode = !environment.production;

  // Local demo driver until IAM provides the authenticated identity.
  private readonly demoDriverId = 1;

  getPlans(): Observable<Plan[]> {
    return this.plansEndpoint.getAll();
  }

  getPlan(id: number): Observable<Plan> {
    return this.plansEndpoint.getById(id);
  }

  createPlan(plan: Plan): Observable<Plan> {
    if (this.backendMode) {
      return throwError(() => new Error('Plan creation from this screen is not available yet.'));
    }

    return this.plansEndpoint.create(plan);
  }

  updatePlan(plan: Plan): Observable<Plan> {
    if (this.backendMode) {
      return throwError(() => new Error('The backend does not support editing plans.'));
    }

    return this.plansEndpoint.update(plan, plan.id);
  }

  deletePlan(id: number): Observable<void> {
    if (this.backendMode) {
      return throwError(() => new Error('The backend does not support deleting plans.'));
    }

    return this.plansEndpoint.delete(id);
  }

  getSubscriptions(): Observable<Subscription[]> {
    if (!this.backendMode) {
      return this.subscriptionsEndpoint.getAll();
    }

    return this.http
      .get<BackendSubscription[]>('/api/v1/subscriptions', {
        params: { driverId: this.demoDriverId },
      })
      .pipe(
        map((resources) => resources.map((resource) => this.fromBackendSubscription(resource))),
      );
  }

  getSubscription(id: number): Observable<Subscription> {
    if (!this.backendMode) {
      return this.subscriptionsEndpoint.getById(id);
    }

    return this.getSubscriptions().pipe(
      map((subscriptions) => {
        const subscription = subscriptions.find((item) => item.id === id);

        if (!subscription) {
          throw new Error('Subscription not found.');
        }

        return subscription;
      }),
    );
  }

  createSubscription(subscription: Subscription): Observable<Subscription> {
    if (!this.backendMode) {
      return this.subscriptionsEndpoint.create(subscription);
    }

    const resource = {
      driverId: this.demoDriverId,
      planId: Number(subscription.planId),
    };

    return this.http
      .post<BackendSubscription>('/api/v1/subscriptions', resource)
      .pipe(map((created) => this.fromBackendSubscription(created)));
  }


  updateSubscription(subscription: Subscription): Observable<Subscription> {
    return this.backendMode
      ? this.http.patch<BackendSubscription>(
        `/api/v1/subscriptions/${subscription.id}/plan`,
        {
          driverId: this.demoDriverId,
          planId: Number(subscription.planId),
        }
      ).pipe(
        map(item => this.fromBackendSubscription(item))
      )
      : this.subscriptionsEndpoint.update(subscription, subscription.id);
  }

  deleteSubscription(id: number): Observable<void> {
    return this.backendMode
      ? this.http.patch<BackendSubscription>(
        `/api/v1/subscriptions/${id}/cancel`,
        {
          driverId: this.demoDriverId,
        }
      ).pipe(
        map(() => undefined)
      )
      : this.subscriptionsEndpoint.delete(id);
  }

  private fromBackendSubscription(resource: BackendSubscription): Subscription {
    return new Subscription({
      id: resource.id,
      driverId: String(resource.driverId),
      planId: String(resource.planId),
      status: resource.status,
      startDate: resource.startDate,
      endDate: resource.endDate,
      vehicleLimit: resource.vehicleLimit,
      paymentStatus: 'NOT_APPLICABLE',
      paymentAmount: 0,
    });
  }

  changeSubscriptionStatus(
    id: number,
    status: 'ACTIVE' | 'SUSPENDED'
  ): Observable<Subscription> {
    return this.backendMode
      ? this.http.patch<BackendSubscription>(
        `/api/v1/subscriptions/${id}/status`,
        {
          driverId: this.demoDriverId,
          status
        }
      ).pipe(
        map(resource => this.fromBackendSubscription(resource))
      )
      : throwError(() => new Error(
        'Subscription status management requires Spring Boot'
      ));
  }

}
