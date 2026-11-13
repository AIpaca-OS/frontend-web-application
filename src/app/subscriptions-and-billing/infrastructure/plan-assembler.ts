import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Plan } from '../domain/model/plan.entity';
import { PlanResource, PlansResponse } from './plans-response';

/**
 * Maps plan entities to and from API resources.
 */
export class PlanAssembler implements BaseAssembler<Plan, PlanResource, PlansResponse> {
  /**
   * Converts a PlansResponse to an array of Plan entities.
   * @param response - The API response containing plans.
   * @returns An array of Plan entities.
   */
  toEntitiesFromResponse = (response: PlansResponse): Plan[] =>
    response.plans.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a PlanResource to a Plan entity.
   * @param resource - The resource to convert.
   * @returns The converted Plan entity.
   */
  toEntityFromResource = (resource: PlanResource): Plan =>
    new Plan({
      id: resource.id,
      name: resource.name,
      description: resource.description,
      referencePrice: Number(resource.referencePrice),
      active: resource.active,
    });

  /**
   * Converts a Plan entity to a PlanResource (CreatePlanRequest fields plus ID).
   * @param entity - The entity to convert.
   * @returns The converted PlanResource.
   */
  toResourceFromEntity = (entity: Plan): PlanResource => ({
    id: entity.id,
    name: entity.name,
    description: entity.description,
    referencePrice: entity.referencePrice,
    currency: 'PEN',
    billingPeriodMonths: 1,
    vehicleLimit: null,
    active: entity.active,
  });
}
