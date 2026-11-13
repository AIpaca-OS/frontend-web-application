import { computed, DestroyRef, inject, Injectable, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { IncidentsApi } from '../infrastructure/incidents-api';
import { Incident } from '../domain/model/incident.entity';
import { Delay } from '../domain/model/delay.entity';
import { toErrorMessageKey } from '../../shared/infrastructure/api-error';

/**
 * Holds Incident Management application state and coordinates incident and delay operations.
 *
 * @remarks
 * Incidents and delays are always scoped to a trip (the API requires `tripId`).
 * `error` contains an i18n key that the views render with TranslatePipe.
 */
@Injectable({ providedIn: 'root' })
export class IncidentsStore {
  private readonly incidentsApi = inject(IncidentsApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly incidentsSignal = signal<Incident[]>([]);

  /**
   * Readonly signal for the incidents of the loaded trip.
   */
  readonly incidents = this.incidentsSignal.asReadonly();

  private readonly delaysSignal = signal<Delay[]>([]);

  /**
   * Readonly signal for the delays of the loaded trip.
   */
  readonly delays = this.delaysSignal.asReadonly();

  private readonly loadingSignal = signal(false);

  /**
   * Readonly signal indicating if data is loading.
   */
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);

  /**
   * Readonly signal for the current error (i18n key).
   */
  readonly error = this.errorSignal.asReadonly();

  /**
   * Computed signal for the count of incidents.
   */
  readonly incidentsCount = computed(() => this.incidents().length);

  /**
   * Computed signal for the count of delays.
   */
  readonly delaysCount = computed(() => this.delays().length);

  /**
   * Loads the incidents and delays of a trip.
   * @param tripId - Trip identifier.
   */
  loadTrip = (tripId: number): void => {
    this.loadIncidents(tripId);
    this.loadDelays(tripId);
  };

  /**
   * Selects an incident by identifier.
   * @param id - Incident identifier.
   * @returns Reactive selection for the requested incident.
   */
  getIncidentById = (id: number): Signal<Incident | undefined> =>
    computed(() => this.incidents().find(incident => incident.id === id));

  /**
   * Selects a delay by identifier.
   * @param id - Delay identifier.
   * @returns Reactive selection for the requested delay.
   */
  getDelayById = (id: number): Signal<Delay | undefined> =>
    computed(() => this.delays().find(delay => delay.id === id));

  /**
   * Reports an incident.
   * @param incident - Incident to report.
   * @returns True when the incident was registered.
   */
  addIncident = async (incident: Incident): Promise<boolean> => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      // A POST must not be retried automatically: it may have been persisted already.
      const created = await firstValueFrom(this.incidentsApi.createIncident(incident));
      this.incidentsSignal.update(incidents => [...incidents, created]);
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'errors.reportIncident'));
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  };

  /**
   * Updates an incident.
   * @param incident - Incident to update.
   */
  updateIncident = (incident: Incident): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentsApi.updateIncident(incident).subscribe({
      next: updated => {
        this.incidentsSignal.update(incidents => incidents.map(current => current.id === updated.id ? updated : current));
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'errors.updateIncident'));
        this.loadingSignal.set(false);
      }
    });
  };

  /**
   * Reports a delay.
   * @param delay - Delay to report.
   * @returns True when the delay was registered.
   */
  addDelay = async (delay: Delay): Promise<boolean> => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const created = await firstValueFrom(this.incidentsApi.createDelay(delay));
      this.delaysSignal.update(delays => [...delays, created]);
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'errors.reportDelay'));
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  };

  /**
   * Reports an update of an existing delay (the previous one becomes SUPERSEDED).
   * @param delay - Delay with the new values.
   */
  updateDelay = (delay: Delay): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentsApi.updateDelay(delay).subscribe({
      next: created => {
        this.delaysSignal.update(delays => [...delays, created]);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'errors.reportDelay'));
        this.loadingSignal.set(false);
      }
    });
  };

  /**
   * Loads the incidents of a trip.
   * @param tripId - Trip identifier.
   */
  private loadIncidents = (tripId: number): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentsApi.getIncidents(tripId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: incidents => {
        this.incidentsSignal.set(incidents);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'errors.loadIncidents'));
        this.loadingSignal.set(false);
      }
    });
  };

  /**
   * Loads the delays of a trip.
   * @param tripId - Trip identifier.
   */
  private loadDelays = (tripId: number): void => {
    this.loadingSignal.set(true);
    this.incidentsApi.getDelays(tripId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: delays => {
        this.delaysSignal.set(delays);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'errors.loadDelays'));
        this.loadingSignal.set(false);
      }
    });
  };

  /**
   * Normalizes unknown errors into an i18n key.
   * @param error - Source error.
   * @param fallback - Key used when the error carries no HTTP information.
   * @returns Translation key.
   */
  private formatError = (error: unknown, fallback: string): string => toErrorMessageKey(error, fallback);
}
