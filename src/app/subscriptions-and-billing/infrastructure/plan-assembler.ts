import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Plan } from '../domain/model/plan.entity';
import { PlanResource, PlansResponse } from './plans-response';

export class PlanAssembler implements BaseAssembler<Plan, PlanResource, PlansResponse> {
  toEntitiesFromResponse(response: PlansResponse): Plan[] {
    return response.plans.map((resource) => this.toEntityFromResource(resource));
  }

  toEntityFromResource(resource: PlanResource): Plan {
    return new Plan({
      id: Number(resource.id),
      name: resource.name,
      referencePrice: Number(resource.referencePrice),
      active: resource.active,
    });
  }

  toResourceFromEntity(entity: Plan): PlanResource {
    return {
      id: entity.id,
      name: entity.name,
      referencePrice: entity.referencePrice,
      active: entity.active,
    };
  }
}
