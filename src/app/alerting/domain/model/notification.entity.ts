import {BaseEntity} from '../../../shared/domain/model/base-entity';

export class Notification implements BaseEntity {
  #id: number;
  #type: string;
  #priority: string;
  #title: string;
  #message: string;
  #createdAt: string;
  #readAt: string;
  #read: boolean;
  #routeId: number;
  #studentId: number | null;

  constructor(notification: {
    id: number;
    type: string;
    priority: string;
    title: string;
    message: string;
    createdAt: string;
    readAt: string;
    read: boolean;
    routeId: number;
    studentId: number | null;
  }) {
    this.#id = notification.id;
    this.#type = notification.type;
    this.#priority = notification.priority;
    this.#title = notification.title;
    this.#message = notification.message;
    this.#createdAt = notification.createdAt;
    this.#readAt = notification.readAt;
    this.#read = notification.read;
    this.#routeId = notification.routeId;
    this.#studentId = notification.studentId;
  }

  markAsRead(): void {
    this.#readAt = new Date().toISOString();
    this.#read = true;
  }
  get id(): number {
    return this.#id;
  }

  set id(value: number) {
    this.#id = value;
  }

  get type(): string {
    return this.#type;
  }

  set type(value: string) {
    this.#type = value;
  }

  get priority(): string {
    return this.#priority;
  }

  set priority(value: string) {
    this.#priority = value;
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

  get createdAt(): string {
    return this.#createdAt;
  }

  set createdAt(value: string) {
    this.#createdAt = value;
  }

  get readAt(): string {
    return this.#readAt;
  }

  set readAt(value: string) {
    this.#readAt = value;
  }

  get read(): boolean {
    return this.#read;
  }

  set read(value: boolean) {
    this.#read = value;
  }

  get routeId(): number {
    return this.#routeId;
  }

  set routeId(value: number) {
    this.#routeId = value;
  }

  get studentId(): number | null {
    return this.#studentId;
  }

  set studentId(value: number | null) {
    this.#studentId = value;
  }
}
