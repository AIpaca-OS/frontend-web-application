import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionResource, SubscriptionsResponse } from './subscriptions-response';
import { SubscriptionAssembler } from './subscription-assembler';
import { environment } from '../../../environments/environment';

/**
 * Endpoint client for the Subscriptions resource.
 *
 * @remarks
 * Supported operations (Swagger): GET /subscriptions?driverId, POST /subscriptions and
 * PATCH /subscriptions/{id}/plan|status|cancel. There is no GET by ID, PUT or DELETE.
 */
export class SubscriptionsApiEndpoint extends BaseApiEndpoint<Subscription, SubscriptionResource, SubscriptionsResponse, SubscriptionAssembler> {
  /**
   * Creates an instance of SubscriptionsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderSubscriptionsEndpointPath}`, new SubscriptionAssembler());
  }

  /**
   * Fetches the subscriptions of a driver.
   * @param driverId - Driver profile identifier.
   * @returns Stream with the mapped subscriptions.
   */
  getByDriver(driverId: number): Observable<Subscription[]> {
    return this.http.get<SubscriptionResource[]>(this.endpointUrl, { params: { driverId } }).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to fetch subscriptions'))
    );
  }

  /**
   * Activates a subscription (ActivateSubscriptionResource).
   * @param driverId - Driver profile identifier.
   * @param planId - Plan identifier.
   * @returns Stream with the created subscription.
   */
  activate(driverId: number, planId: number): Observable<Subscription> {
    return this.http.post<SubscriptionResource>(this.endpointUrl, { driverId, planId }).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to activate subscription'))
    );
  }

  /**
   * Changes the plan of an active subscription.
   * @param id - Subscription identifier.
   * @param driverId - Driver profile identifier.
   * @param planId - New plan identifier.
   * @returns Stream with the updated subscription.
   */
  changePlan(id: number, driverId: number, planId: number): Observable<Subscription> {
    return this.http.patch<SubscriptionResource>(`${this.endpointUrl}/${id}/plan`, { driverId, planId }).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to change subscription plan'))
    );
  }

  /**
   * Pauses or resumes a subscription.
   * @param id - Subscription identifier.
   * @param driverId - Driver profile identifier.
   * @param status - New status (ACTIVE or SUSPENDED).
   * @returns Stream with the updated subscription.
   */
  changeStatus(id: number, driverId: number, status: string): Observable<Subscription> {
    return this.http.patch<SubscriptionResource>(`${this.endpointUrl}/${id}/status`, { driverId, status }).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to change subscription status'))
    );
  }

  /**
   * Cancels a subscription.
   * @param id - Subscription identifier.
   * @param driverId - Driver profile identifier.
   * @returns Stream with the cancelled subscription.
   */
  cancel(id: number, driverId: number): Observable<Subscription> {
    return this.http.patch<SubscriptionResource>(`${this.endpointUrl}/${id}/cancel`, { driverId }).pipe(
      map(cancelled => this.assembler.toEntityFromResource(cancelled)),
      catchError(this.handleError('Failed to cancel subscription'))
    );
  }
}
