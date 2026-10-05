import {BaseEntity} from '../../../shared/domain/model/base-entity';

export class Notification implements BaseEntity {

  #id: number;
  #type: string;
  #priority: string;
  #title: string;
  #message: string;
  #time: string;
  #date: string;
  #read: boolean;
  #routeId: number;
  #studentId: number | null;

  constructor(notification: { id: number; type: string; priority: string; title: string; message: string; time: string; date: string; read: boolean; routeId: number; studentId: number | null }) {

    this.#id = notification.id;
    this.#type = notification.type;
    this.#priority = notification.priority;
    this.#title = notification.title;
    this.#message = notification.message;
    this.#time = notification.time;
    this.#date = notification.date;
    this.#read = notification.read;
    this.#routeId = notification.routeId;
    this.#studentId = notification.studentId;

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

  get time(): string {
    return this.#time;
  }

  set time(value: string) {
    this.#time = value;
  }

  get date(): string {
    return this.#date;
  }

  set date(value: string) {
    this.#date = value;
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
