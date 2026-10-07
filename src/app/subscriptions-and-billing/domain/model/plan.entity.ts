import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class Plan implements BaseEntity {
  #id: number;
  #name: string;
  #description: string;
  #referencePrice: number;
  #active: boolean;

  constructor(plan: {
    id: number;
    name: string;
    description: string;
    referencePrice: number;
    active: boolean;
  }) {
    this.#id = plan.id;
    this.#name = plan.name;
    this.#description = plan.description;
    this.#referencePrice = plan.referencePrice;
    this.#active = plan.active;
  }

  get id(): number {
    return this.#id;
  }

  set id(value: number) {
    this.#id = value;
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    this.#name = value;
  }

  get description(): string {
    return this.#description;
  }

  set description(value: string) {
    this.#description = value;
  }

  get referencePrice(): number {
    return this.#referencePrice;
  }

  set referencePrice(value: number) {
    this.#referencePrice = value;
  }

  get active(): boolean {
    return this.#active;
  }

  set active(value: boolean) {
    this.#active = value;
  }
}
