import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Plan } from '../domain/model/plan.entity';
import { PlanResource, PlansResponse } from './plans-response';

export class PlanAssembler implements BaseAssembler<Plan, PlanResource, PlansResponse> {
  toEntitiesFromResponse(response: PlansResponse): Plan[] {
    return response.plans.map((resource) => this.toEntityFromResource(resource));
  }

  toEntityFromResource(resource: PlanResource): Plan {
    return new Plan({
      ...resource,
      id: Number(resource.id),
      referencePrice: Number(resource.referencePrice),
    });
  }

  toResourceFromEntity(entity: Plan): PlanResource {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      referencePrice: entity.referencePrice,
      currency: entity.currency,
      billingPeriodMonths: entity.billingPeriodMonths,
      vehicleLimit: entity.vehicleLimit,
      active: entity.active,
    };
  }
}
