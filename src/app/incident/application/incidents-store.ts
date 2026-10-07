import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IncidentsApi } from '../infrastructure/incidents-api';
import { Incident } from '../domain/model/incident.entity';
import { Delay } from '../domain/model/delay.entity';
import { retry } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IncidentsStore {
  private readonly incidentsApi = inject(IncidentsApi);

  private readonly incidentsSignal = signal<Incident[]>([]);
  readonly incidents = this.incidentsSignal.asReadonly();

  private readonly delaysSignal = signal<Delay[]>([]);
  readonly delays = this.delaysSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  readonly incidentsCount = computed(() => this.incidents().length);
  readonly delaysCount = computed(() => this.delays().length);

  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found')
        ? `${fallback}: Not found`
        : error.message;
    }
    return fallback;
  }

  constructor() {
    this.loadIncidents();
    this.loadDelays();
  }

  private loadIncidents() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentsApi
      .getIncidents()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (incidents) => {
          this.incidentsSignal.set(incidents);
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to load incidents'));
          this.loadingSignal.set(false);
        },
      });
  }

  private loadDelays() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentsApi
      .getDelays()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (delays) => {
          this.delaysSignal.set(delays);
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to load delays'));
          this.loadingSignal.set(false);
        },
      });
  }

  getIncidentById(id: number): Signal<Incident | undefined> {
    return computed(() =>
      id ? this.incidents().find((incident) => incident.id === id) : undefined,
    );
  }

  addIncident(incident: Incident) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentsApi
      .createIncident(incident)
      .pipe(retry(2))
      .subscribe({
        next: (createdIncident) => {
          this.incidentsSignal.update((incidents) => [
            ...incidents,
            createdIncident,
          ]);
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to create incident'));
          this.loadingSignal.set(false);
        },
      });
  }

  updateIncident(incident: Incident) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentsApi
      .updateIncident(incident)
      .pipe(retry(2))
      .subscribe({
        next: (updatedIncident) => {
          this.incidentsSignal.update((incidents) =>
            incidents.map((i) => (i.id === updatedIncident.id ? updatedIncident : i)),
          );
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to update incident'));
          this.loadingSignal.set(false);
        }
      });
  }

  deleteIncident(id: number) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentsApi
      .deleteIncident(id)
      .pipe(retry(2))
      .subscribe({
        next: () => {
          this.incidentsSignal.update((incidents) =>
            incidents.filter((i) => i.id !== id),
          );
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to delete incident'));
          this.loadingSignal.set(false);
        }
      });
  }

  getDelayById(id: number): Signal<Delay | undefined> {
    return computed(() =>
      id ? this.delays().find((delay) => delay.id === id) : undefined,
    );
  }

  addDelay(delay: Delay) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentsApi
      .createDelay(delay)
      .pipe(retry(2))
      .subscribe({
        next: (createdDelay) => {
          this.delaysSignal.update((delays) => [
            ...delays,
          ]);
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to create delay'));
          this.loadingSignal.set(false);
        },
      });
  }

  updateDelay(delay: Delay) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentsApi
      .updateDelay(delay)
      .pipe(retry(2))
      .subscribe({
        next: (updatedDelay) => {
          this.delaysSignal.update((delays) =>
            delays.map((d) => (d.id === updatedDelay.id ? updatedDelay : d)),
          );
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to update delay'));
          this.loadingSignal.set(false);
        }
      });
  }

  deleteDelay(id: number) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentsApi
      .deleteDelay(id)
      .pipe(retry(2))
      .subscribe({
        next: () => {
          this.delaysSignal.update((delays) =>
            delays.filter((d) => d.id !== id),
          );
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to delete delay'));
          this.loadingSignal.set(false);
        }
      });
  }

}
