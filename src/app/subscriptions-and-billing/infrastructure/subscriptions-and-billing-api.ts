import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap, throwError } from 'rxjs';
import { DemoProfilesApi } from '../../identity-and-access-management/infrastructure/demo-profiles-api';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Plan } from '../domain/model/plan.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { PlansApiEndpoint } from './plans-api-endpoint';
import { SubscriptionsApiEndpoint } from './subscriptions-api-endpoint';
import { environment } from '../../../environments/environment';

interface BackendPlan {
  id: number;
  name: string;
  description: string;
  referencePrice: number;
  active: boolean;
}
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

  private readonly profiles = inject(DemoProfilesApi);

  private fromBackendPlan(resource: BackendPlan): Plan {
    return new Plan({
      id: resource.id, name: resource.name,
      description: resource.description,
      referencePrice: Number(resource.referencePrice), active: resource.active,
    });
  }
  private fromBackendSubscription(resource: BackendSubscription): Subscription {
    return new Subscription({
      id: resource.id,
      driverId: String(resource.driverId),
      planId: String(resource.planId),
      status: resource.status,
      startDate: resource.startDate,
      paymentStatus: 'NOT_APPLICABLE',
      paymentAmount: 0,
    });
  }

  getPlans(): Observable<Plan[]> {
    return this.http.get<BackendPlan[]>('/api/v1/plans')
      .pipe(map(items => items.map(item => this.fromBackendPlan(item))));
  }
  getPlan(id: number): Observable<Plan> {
    return this.http.get<BackendPlan>('/api/v1/plans/' + id)
      .pipe(map(item => this.fromBackendPlan(item)));
  }
  createPlan(plan: Plan): Observable<Plan> {
    return this.backendMode
      ? throwError(() => new Error('Plan creation is not part of the local driver demo'))
      : this.plansEndpoint.create(plan);
  }
  updatePlan(plan: Plan): Observable<Plan> {
    return this.backendMode
      ? throwError(() => new Error('Plan editing is not supported by the Spring API'))
      : this.plansEndpoint.update(plan, plan.id);
  }
  deletePlan(id: number): Observable<void> {
    return this.backendMode
      ? throwError(() => new Error('Plan deletion is not supported by the Spring API'))
      : this.plansEndpoint.delete(id);
  }

  getSubscriptions(): Observable<Subscription[]> {
    return this.backendMode
      ? this.profiles.id('driver').pipe(
          switchMap(driverId => this.http.get<BackendSubscription[]>('/api/v1/subscriptions', {
            params: { driverId },
          })),
          map(items => items.map(item => this.fromBackendSubscription(item))),
        )
      : this.subscriptionsEndpoint.getAll();
  }
  getSubscription(id: number): Observable<Subscription> {
    return this.backendMode
      ? this.getSubscriptions().pipe(map(rows => {
          const found = rows.find(row => row.id === id);
          if (!found) throw new Error('Subscription not found');
          return found;
        }))
      : this.subscriptionsEndpoint.getById(id);
  }
  createSubscription(subscription: Subscription): Observable<Subscription> {
    return this.backendMode
      ? this.profiles.id('driver').pipe(
          switchMap(driverId => this.http.post<BackendSubscription>('/api/v1/subscriptions', {
            driverId, planId: Number(subscription.planId),
          })),
          map(item => this.fromBackendSubscription(item)),
        )
      : this.subscriptionsEndpoint.create(subscription);
  }
  updateSubscription(subscription: Subscription): Observable<Subscription> {
    return this.backendMode
      ? throwError(() => new Error('Subscription editing is not supported by the Spring API'))
      : this.subscriptionsEndpoint.update(subscription, subscription.id);
  }
  deleteSubscription(id: number): Observable<void> {
    return this.backendMode
      ? throwError(() => new Error('Subscription cancellation is not implemented in Spring yet'))
      : this.subscriptionsEndpoint.delete(id);
  }
}
