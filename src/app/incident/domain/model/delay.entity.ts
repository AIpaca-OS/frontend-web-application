import {BaseEntity} from '../../../shared/domain/model/base-entity';

export class Delay implements BaseEntity {

  #id: number;
  #cause: string;
  #priority: string;
  #magnitude: string;
  #studentIds: number[];
  #createdAt: string;

  constructor(delay: {
    id: number;
    cause: string;
    priority: string;
    magnitude: string;
    studentIds: number[];
    createdAt: string;
  }) {

    this.#id = delay.id;
    this.#cause = delay.cause;
    this.#priority = delay.priority;
    this.#magnitude = delay.magnitude;
    this.#studentIds = delay.studentIds;
    this.#createdAt = delay.createdAt;
  }

  get id(): number {
    return this.#id;
  }

  set id(value: number) {
    this.#id = value;
  }

  get cause(): string {
    return this.#cause;
  }

  set cause(value: string) {
    this.#cause = value;
  }

  get priority(): string {
    return this.#priority;
  }

  set priority(value: string) {
    this.#priority = value;
  }

  get magnitude(): string {
    return this.#magnitude;
  }

  set magnitude(value: string) {
    this.#magnitude = value;
  }

  get studentIds(): number[] {
    return this.#studentIds;
  }

  set studentIds(value: number[]) {
    this.#studentIds = value;
  }

  get createdAt(): string {
    return this.#createdAt;
  }

  set createdAt(value: string) {
    this.#createdAt = value;
  }
}
