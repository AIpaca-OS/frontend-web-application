import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class Subscription implements BaseEntity {
  #id: number;
  #driverId: string;
  #planId: string;
  #status: string;
  #startDate: string;
  #paymentStatus: string;
  #paymentAmount: number;

  constructor(subscription: {
    id: number;
    driverId: string;
    planId: string;
    status: string;
    startDate: string;
    paymentStatus: string;
    paymentAmount: number;
  }) {
    this.#id = subscription.id;
    this.#driverId = subscription.driverId;
    this.#planId = subscription.planId;
    this.#status = subscription.status;
    this.#startDate = subscription.startDate;
    this.#paymentStatus = subscription.paymentStatus;
    this.#paymentAmount = subscription.paymentAmount;
  }

  get id(): number {
    return this.#id;
  }

  set id(value: number) {
    this.#id = value;
  }

  get driverId(): string {
    return this.#driverId;
  }

  set driverId(value: string) {
    this.#driverId = value;
  }

  get planId(): string {
    return this.#planId;
  }

  set planId(value: string) {
    this.#planId = value;
  }

  get status(): string {
    return this.#status;
  }

  set status(value: string) {
    this.#status = value;
  }

  get startDate(): string {
    return this.#startDate;
  }

  set startDate(value: string) {
    this.#startDate = value;
  }

  get paymentStatus(): string {
    return this.#paymentStatus;
  }

  set paymentStatus(value: string) {
    this.#paymentStatus = value;
  }

  get paymentAmount(): number {
    return this.#paymentAmount;
  }

  set paymentAmount(value: number) {
    this.#paymentAmount = value;
  }
}
