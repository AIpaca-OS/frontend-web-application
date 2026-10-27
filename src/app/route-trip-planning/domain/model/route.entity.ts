import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { RouteStop } from './route-stop.entity';
import { RouteSchedule } from './route-schedule.entity';

export type RouteShift = 'MORNING' | 'AFTERNOON';

export class Route implements BaseEntity {
  #id: number;
  #name: string;
  #code: string;
  #departureTime: string;
  #status: string;
  #shift: RouteShift;
  #stops: RouteStop[];
  #legacyStopsCount: number;
  #schedule: RouteSchedule[];
  #scheduleConfirmed: boolean;

  constructor(props: {
    id: number;
    name: string;
    code: string;
    departureTime: string;
    status: string;
    stopsCount?: number;
    shift?: RouteShift;
    stops?: RouteStop[];
    schedule?: RouteSchedule[];
    scheduleConfirmed?: boolean;
  }) {
    this.#id = props.id;
    this.#name = props.name;
    this.#code = props.code;
    this.#departureTime = props.departureTime;
    this.#status = props.status;
    this.#shift = props.shift ?? 'MORNING';
    this.#stops = [...(props.stops ?? [])].sort((a, b) => a.position - b.position);
    this.#legacyStopsCount = props.stopsCount ?? 0;
    this.#schedule = (props.schedule ?? []).map(row => ({ ...row }));
    this.#scheduleConfirmed = props.scheduleConfirmed ?? false;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get name(): string { return this.#name; }
  set name(value: string) { this.#name = value; }
  get code(): string { return this.#code; }
  set code(value: string) { this.#code = value; }
  get departureTime(): string { return this.#departureTime; }
  set departureTime(value: string) { this.#departureTime = value; }
  get status(): string { return this.#status; }
  set status(value: string) { this.#status = value; }
  get shift(): RouteShift { return this.#shift; }
  set shift(value: RouteShift) { this.#shift = value; }

  get stops(): RouteStop[] { return this.#stops.map(stop => ({ ...stop })); }
  set stops(value: RouteStop[]) {
    this.#stops = value.map(stop => ({ ...stop })).sort((a, b) => a.position - b.position);
    this.#legacyStopsCount = this.#stops.length;
  }

  get schedule(): RouteSchedule[] { return this.#schedule.map(row => ({ ...row })); }
  set schedule(value: RouteSchedule[]) { this.#schedule = value.map(row => ({ ...row })); }
  get scheduleConfirmed(): boolean { return this.#scheduleConfirmed; }
  set scheduleConfirmed(value: boolean) { this.#scheduleConfirmed = value; }

  /** Mantiene la lectura de registros anteriores de MockAPI. */
  get stopsCount(): number {
    return this.#stops.length > 0 ? this.#stops.length : this.#legacyStopsCount;
  }
  set stopsCount(value: number) { this.#legacyStopsCount = value; }
}
