import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionResource, SubscriptionsResponse } from './subscriptions-response';

/**
 * Maps subscription entities to and from API resources.
 *
 * @remarks
 * The API has no payment information: payment fields are set to neutral values.
 */
export class SubscriptionAssembler implements BaseAssembler<Subscription, SubscriptionResource, SubscriptionsResponse> {
  /**
   * Converts a SubscriptionsResponse to an array of Subscription entities.
   * @param response - The API response containing subscriptions.
   * @returns An array of Subscription entities.
   */
  toEntitiesFromResponse = (response: SubscriptionsResponse): Subscription[] =>
    response.subscriptions.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a SubscriptionResource to a Subscription entity.
   * @param resource - The resource to convert.
   * @returns The converted Subscription entity.
   */
  toEntityFromResource = (resource: SubscriptionResource): Subscription =>
    new Subscription({
      id: resource.id,
      driverId: String(resource.driverId),
      planId: String(resource.planId),
      status: resource.status,
      startDate: resource.startDate,
      paymentStatus: 'NOT_APPLICABLE',
      paymentAmount: 0,
    });

  /**
   * Converts a Subscription entity to a SubscriptionResource.
   * @param entity - The entity to convert.
   * @returns The converted SubscriptionResource.
   */
  toResourceFromEntity = (entity: Subscription): SubscriptionResource => ({
    id: entity.id,
    driverId: Number(entity.driverId),
    planId: Number(entity.planId),
    status: entity.status,
    startDate: entity.startDate,
    endDate: null,
    active: entity.status === 'ACTIVE',
    vehicleLimit: null,
  });
}
