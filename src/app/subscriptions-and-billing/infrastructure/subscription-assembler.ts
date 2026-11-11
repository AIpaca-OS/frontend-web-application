import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionResource, SubscriptionsResponse } from './subscriptions-response';

export class SubscriptionAssembler implements BaseAssembler<
  Subscription,
  SubscriptionResource,
  SubscriptionsResponse
> {
  toEntitiesFromResponse(response: SubscriptionsResponse): Subscription[] {
    return response.subscriptions.map((resource) => this.toEntityFromResource(resource));
  }

  toEntityFromResource(resource: SubscriptionResource): Subscription {
    return new Subscription({
      ...resource,
      id: Number(resource.id),
      driverId: Number(resource.driverId),
      planId: Number(resource.planId),
    });
  }

  toResourceFromEntity(entity: Subscription): SubscriptionResource {
    return {
      id: entity.id,
      driverId: entity.driverId,
      planId: entity.planId,
      status: entity.status,
      startDate: entity.startDate,
      endDate: entity.endDate,
      active: entity.active,
      vehicleLimit: entity.vehicleLimit,
    };
  }
}
