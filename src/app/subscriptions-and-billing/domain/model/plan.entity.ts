import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class Plan implements BaseEntity {
  id: number;
  readonly name: string;
  readonly description: string;
  readonly referencePrice: number;
  readonly currency: string;
  readonly billingPeriodMonths: number | null;
  readonly vehicleLimit: number | null;
  readonly active: boolean;

  constructor(plan: {
    id: number;
    name: string;
    description: string;
    referencePrice: number;
    currency: string;
    billingPeriodMonths: number | null;
    vehicleLimit: number | null;
    active: boolean;
  }) {
    this.id = plan.id;
    this.name = plan.name;
    this.description = plan.description;
    this.referencePrice = plan.referencePrice;
    this.currency = plan.currency;
    this.billingPeriodMonths = plan.billingPeriodMonths;
    this.vehicleLimit = plan.vehicleLimit;
    this.active = plan.active;
  }
}
