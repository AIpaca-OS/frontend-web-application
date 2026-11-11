import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class Subscription implements BaseEntity {
  id: number;
  readonly driverId: number;
  readonly planId: number;
  readonly status: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly active: boolean;
  readonly vehicleLimit: number | null;

  constructor(subscription: {
    id: number;
    driverId: number;
    planId: number;
    status: string;
    startDate: string;
    endDate: string;
    active: boolean;
    vehicleLimit: number | null;
  }) {
    this.id = subscription.id;
    this.driverId = subscription.driverId;
    this.planId = subscription.planId;
    this.status = subscription.status;
    this.startDate = subscription.startDate;
    this.endDate = subscription.endDate;
    this.active = subscription.active;
    this.vehicleLimit = subscription.vehicleLimit;
  }
}
