import {BaseEntity} from '../../../shared/domain/model/base-entity';

export class Incident implements BaseEntity {

  #id: number;
  #title: string;
  #message: string;
  #priority: string;
  #studentIds: number[];
  #resolved: boolean;
  #resolvedAt: string;
  #createdAt: string;

  constructor(incident: {
    id: number;
    title: string;
    message: string;
    priority: string;
    studentIds: number[];
    resolved: boolean;
    resolvedAt: string;
    createdAt: string;
  })
  {
    this.#id = incident.id;
    this.#title = incident.title;
    this.#message = incident.message;
    this.#priority = incident.priority;
    this.#studentIds = incident.studentIds;
    this.#resolved = incident.resolved;
    this.#resolvedAt = incident.resolvedAt;
    this.#createdAt = incident.createdAt;
  }

  markAsResolved(): void {
    this.#resolved = true;
    this.#resolvedAt = new Date().toISOString();
  }

  get id(): number {
    return this.#id;
  }

  set id(value: number) {
    this.#id = value;
  }

  get title(): string {
    return this.#title;
  }

  set title(value: string) {
    this.#title = value;
  }

  get message(): string {
    return this.#message;
  }

  set message(value: string) {
    this.#message = value;
  }

  get priority(): string {
    return this.#priority;
  }

  set priority(value: string) {
    this.#priority = value;
  }

  get studentIds(): number[] {
    return this.#studentIds;
  }

  set studentIds(value: number[]) {
    this.#studentIds = value;
  }

  get resolved(): boolean {
    return this.#resolved;
  }

  set resolved(value: boolean) {
    this.#resolved = value;
  }

  get resolvedAt(): string {
    return this.#resolvedAt;
  }

  set resolvedAt(value: string) {
    this.#resolvedAt = value;
  }

  get createdAt(): string {
    return this.#createdAt;
  }

  set createdAt(value: string) {
    this.#createdAt = value;
  }
}
