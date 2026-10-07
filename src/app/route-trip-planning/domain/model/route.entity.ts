import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class Route implements BaseEntity {
  #id: number;
  #name: string;
  #code: string;
  #departureTime: string;
  #status: string;
  #stopsCount: number;

  constructor(props: {
    id: number;
    name: string;
    code: string;
    departureTime: string;
    status: string;
    stopsCount: number;
  }) {
    this.#id = props.id;
    this.#name = props.name;
    this.#code = props.code;
    this.#departureTime = props.departureTime;
    this.#status = props.status;
    this.#stopsCount = props.stopsCount;
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

  get code(): string {
    return this.#code;
  }

  set code(value: string) {
    this.#code = value;
  }

  get departureTime(): string {
    return this.#departureTime;
  }

  set departureTime(value: string) {
    this.#departureTime = value;
  }

  get status(): string {
    return this.#status;
  }

  set status(value: string) {
    this.#status = value;
  }

  get stopsCount(): number {
    return this.#stopsCount;
  }

  set stopsCount(value: number) {
    this.#stopsCount = value;
  }
}
