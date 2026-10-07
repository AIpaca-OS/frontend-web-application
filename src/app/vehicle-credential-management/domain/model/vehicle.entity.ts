import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class Vehicle implements BaseEntity {
  #id: number;
  #brand: string;
  #model: string;
  #licensePlate: string;
  #capacity: number;
  #year: number;
  #status: string;

  constructor(props: {
    id: number;
    brand: string;
    model: string;
    licensePlate: string;
    capacity: number;
    year: number;
    status: string;
  }) {
    this.#id = props.id;
    this.#brand = props.brand;
    this.#model = props.model;
    this.#licensePlate = props.licensePlate;
    this.#capacity = props.capacity;
    this.#year = props.year;
    this.#status = props.status;
  }

  get id(): number {
    return this.#id;
  }
  set id(value: number) {
    this.#id = value;
  }

  get brand(): string {
    return this.#brand;
  }
  set brand(value: string) {
    this.#brand = value;
  }

  get model(): string {
    return this.#model;
  }
  set model(value: string) {
    this.#model = value;
  }

  get licensePlate(): string {
    return this.#licensePlate;
  }
  set licensePlate(value: string) {
    this.#licensePlate = value;
  }

  get capacity(): number {
    return this.#capacity;
  }
  set capacity(value: number) {
    this.#capacity = value;
  }

  get year(): number {
    return this.#year;
  }
  set year(value: number) {
    this.#year = value;
  }

  get status(): string {
    return this.#status;
  }
  set status(value: string) {
    this.#status = value;
  }
}
