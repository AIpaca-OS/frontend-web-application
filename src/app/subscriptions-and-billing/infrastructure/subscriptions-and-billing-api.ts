import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';
import { Plan } from '../domain/model/plan.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { PlansApiEndpoint } from './plans-api-endpoint';
import { SubscriptionsApiEndpoint } from './subscriptions-api-endpoint';

/**
 * Infrastructure facade for the Subscriptions & Billing bounded context.
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionsAndBillingApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(DemoRoleSession);
  private readonly plansEndpoint = new PlansApiEndpoint(this.http);
  private readonly subscriptionsEndpoint = new SubscriptionsApiEndpoint(this.http);

  /**
   * Runs a request that needs the acting driver profile ID.
   * @param request - Request factory that receives the driver profile ID.
   * @returns Stream of the request, or an error stream with an i18n key.
   */
  private asDriver<T>(request: (driverId: number) => Observable<T>): Observable<T> {
    const driverId = this.session.role() === 'driver' ? this.session.profileId() : null;
    return driverId ? request(driverId) : throwError(() => new Error('errors.driverProfileRequired'));
  }

  /**
   * Retrieves the plan catalog.
   * @returns Stream with the plan collection.
   */
  getPlans = (): Observable<Plan[]> => this.plansEndpoint.getAll();

  /**
   * Retrieves a plan by ID.
   * @param id - Plan identifier.
   * @returns Stream with the plan.
   */
  getPlan = (id: number): Observable<Plan> => this.plansEndpoint.getById(id);

  /**
   * Creates a plan.
   * @param plan - Plan to create.
   * @returns Stream with the created plan.
   */
  createPlan = (plan: Plan): Observable<Plan> => this.plansEndpoint.create(plan);

  /**
   * Retrieves the subscriptions of the acting driver.
   * @returns Stream with the subscription collection.
   */
  getSubscriptions = (): Observable<Subscription[]> =>
    this.asDriver(driverId => this.subscriptionsEndpoint.getByDriver(driverId));

  /**
   * Activates a subscription of the acting driver.
   * @param subscription - Subscription with the selected plan.
   * @returns Stream with the created subscription.
   */
  createSubscription = (subscription: Subscription): Observable<Subscription> =>
    this.asDriver(driverId => this.subscriptionsEndpoint.activate(driverId, Number(subscription.planId)));

  /**
   * Changes the plan of a subscription.
   * @param subscription - Subscription with the new plan.
   * @returns Stream with the updated subscription.
   */
  changeSubscriptionPlan = (subscription: Subscription): Observable<Subscription> =>
    this.asDriver(driverId => this.subscriptionsEndpoint.changePlan(subscription.id, driverId, Number(subscription.planId)));

  /**
   * Pauses or resumes a subscription.
   * @param subscription - Subscription with the new status.
   * @returns Stream with the updated subscription.
   */
  changeSubscriptionStatus = (subscription: Subscription): Observable<Subscription> =>
    this.asDriver(driverId => this.subscriptionsEndpoint.changeStatus(subscription.id, driverId, subscription.status));

  /**
   * Cancels a subscription.
   * @param id - Subscription identifier.
   * @returns Stream with the cancelled subscription.
   */
  cancelSubscription = (id: number): Observable<Subscription> =>
    this.asDriver(driverId => this.subscriptionsEndpoint.cancel(id, driverId));
}
