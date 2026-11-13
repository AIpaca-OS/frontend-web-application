import { computed, DestroyRef, inject, Injectable, signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom, forkJoin, map, Observable } from 'rxjs';
import { Route } from '../domain/model/route.entity';
import { RouteStop } from '../domain/model/route-stop.entity';
import { Trip } from '../domain/model/trip.entity';
import { RouteTripApi } from '../infrastructure/route-trip-api';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';
import { toErrorMessageKey } from '../../shared/infrastructure/api-error';

/**
 * Holds Route & Trip Planning application state and coordinates route and trip operations.
 *
 * @remarks
 * `error` and `tripsError` contain i18n keys that the views render with TranslatePipe.
 */
@Injectable({ providedIn: 'root' })
export class RouteTripStore {
  private readonly routeTripApi = inject(RouteTripApi);
  private readonly session = inject(DemoRoleSession);
  private readonly destroyRef = inject(DestroyRef);

  private readonly routesSignal = signal<Route[]>([]);

  /**
   * Readonly signal for the routes (driver: own routes; tutor: routes of the drivers serving their students).
   */
  readonly routes = this.routesSignal.asReadonly();

  private readonly loadingSignal = signal(false);

  /**
   * Readonly signal indicating if route data is loading.
   */
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);

  /**
   * Readonly signal for the current route error (i18n key).
   */
  readonly error = this.errorSignal.asReadonly();

  /**
   * Computed signal for the count of routes.
   */
  readonly routeCount = computed(() => this.routes().length);

  private readonly tripsSignal = signal<Trip[]>([]);

  /**
   * Readonly signal for the loaded trips.
   */
  readonly trips = this.tripsSignal.asReadonly();

  private readonly tripsLoadingSignal = signal(false);

  /**
   * Readonly signal indicating if a trip operation is in progress.
   */
  readonly tripsLoading = this.tripsLoadingSignal.asReadonly();

  private readonly tripsErrorSignal = signal<string | null>(null);

  /**
   * Readonly signal for the current trip error (i18n key).
   */
  readonly tripsError = this.tripsErrorSignal.asReadonly();

  /**
   * Creates an instance of RouteTripStore and loads the routes of the acting driver.
   */
  constructor() {
    if (this.session.role() === 'driver') this.loadRoutes();
  }

  // Routes

  /**
   * Loads the routes of the acting driver.
   */
  loadRoutes = (): void => this.loadRoutesFrom(this.routeTripApi.getRoutes(), 'errors.loadRoutes');

  /**
   * Loads the routes operated by the given drivers (tutor view).
   * @param driverProfileIds - Driver profile identifiers.
   */
  loadRoutesByDrivers = (driverProfileIds: number[]): void =>
    this.loadRoutesFrom(this.routeTripApi.getRoutesByDrivers([...new Set(driverProfileIds)]), 'errors.loadRoutes');

  /**
   * Selects a route by identifier.
   * @param id - Route identifier.
   * @returns Reactive selection for the requested route.
   */
  getRouteById = (id: string): Signal<Route | undefined> =>
    computed(() => this.routes().find(route => route.id === id));

  /**
   * Creates a route.
   * @param route - Route to create.
   * @returns The created route, or null when the operation failed.
   */
  addRoute = async (route: Route): Promise<Route | null> => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      // A POST must not be retried automatically: it may have been persisted already.
      const created = await firstValueFrom(this.routeTripApi.createRoute(route));
      this.routesSignal.update(routes => [...routes, created]);
      return created;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'errors.createRoute'));
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  };

  /**
   * Updates a route.
   * @param route - Route to update.
   * @returns The updated route, or null when the operation failed.
   */
  updateRoute = async (route: Route): Promise<Route | null> => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const updated = await firstValueFrom(this.routeTripApi.updateRoute(route));
      this.replaceRoute(updated);
      return updated;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'errors.updateRoute'));
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  };

  /**
   * Persists the student-to-stop assignments selected in the route form.
   * @param savedRoute - Route returned by the API (with stop IDs).
   * @param selectedStops - Stops edited in the form (same order).
   * @returns True when the assignments were saved or nothing had to be saved.
   */
  saveAssignments = async (savedRoute: Route, selectedStops: RouteStop[]): Promise<boolean> => {
    const assignments: Array<{ studentId: string; stopId: string }> = [];
    for (const stop of savedRoute.stops) {
      const selected = selectedStops[stop.position - 1];
      if (selected?.studentId && stop.id) assignments.push({ stopId: stop.id, studentId: selected.studentId });
    }
    // An empty draft without previous assignments does not require a request.
    if (assignments.length === 0 && !savedRoute.stops.some(stop => Boolean(stop.studentId))) return true;

    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      this.replaceRoute(await firstValueFrom(this.routeTripApi.replaceAssignments(savedRoute.id, assignments)));
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'errors.saveAssignments'));
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  };

  /**
   * Publishes a route.
   * @param id - Route identifier.
   * @returns True when the route was published.
   */
  publishRoute = async (id: string): Promise<boolean> => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      this.replaceRoute(await firstValueFrom(this.routeTripApi.publishRoute(id)));
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'errors.publishRoute'));
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  };

  /**
   * Deletes a route.
   * @param id - Route identifier.
   */
  deleteRoute = (id: string): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.routeTripApi.deleteRoute(id).subscribe({
      next: () => {
        this.routesSignal.update(routes => routes.filter(route => route.id !== id));
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'errors.deleteRoute'));
        this.loadingSignal.set(false);
      }
    });
  };

  // Trips

  /**
   * Selects the trips of a route.
   * @param routeId - Route identifier.
   * @returns Reactive collection of matching trips.
   */
  getTripsByRouteId = (routeId: string): Signal<Trip[]> =>
    computed(() => this.trips().filter(trip => String(trip.routeId) === routeId));

  /**
   * Loads the trips of the given routes, replacing the previous ones for those routes.
   * @param routeIds - Route identifiers.
   */
  loadTrips = (routeIds: string[]): void => {
    if (routeIds.length === 0) return;
    this.tripsLoadingSignal.set(true);
    this.tripsErrorSignal.set(null);
    forkJoin(routeIds.map(id => this.routeTripApi.getTripsByRoute(Number(id))))
      .pipe(map(batches => batches.flat()))
      .subscribe({
        next: trips => {
          const ids = new Set(routeIds);
          this.tripsSignal.update(current => [...current.filter(trip => !ids.has(String(trip.routeId))), ...trips]);
          this.tripsLoadingSignal.set(false);
        },
        error: error => {
          this.tripsErrorSignal.set(this.formatError(error, 'errors.loadTrips'));
          this.tripsLoadingSignal.set(false);
        }
      });
  };

  /**
   * Plans a trip for a published route with an assigned vehicle.
   * @param route - Route to plan.
   * @param serviceDate - Service date (YYYY-MM-DD).
   * @returns True when the trip was planned.
   */
  planTrip = async (route: Route, serviceDate: string): Promise<boolean> => {
    if (route.status.toUpperCase() !== 'PUBLISHED') return this.rejectTrip('errors.tripRouteNotPublished');
    if (!route.vehicleId) return this.rejectTrip('errors.tripWithoutVehicle');
    return this.runTripOperation(this.routeTripApi.planTrip(route, serviceDate), 'errors.planTrip');
  };

  /**
   * Starts a scheduled trip.
   * @param trip - Trip to start.
   * @returns True when the trip was started.
   */
  startTrip = (trip: Trip): Promise<boolean> =>
    this.runTripOperation(this.routeTripApi.startTrip(trip.id), 'errors.updateTrip');

  /**
   * Completes a trip in progress.
   * @param trip - Trip to complete.
   * @returns True when the trip was completed.
   */
  completeTrip = (trip: Trip): Promise<boolean> =>
    this.runTripOperation(this.routeTripApi.completeTrip(trip.id), 'errors.updateTrip');

  /**
   * Marks the stop of a passenger as served.
   * @param trip - Trip in progress.
   * @param stopId - Stop identifier.
   * @returns True when the stop was served.
   */
  serveStop = (trip: Trip, stopId: string): Promise<boolean> =>
    this.runTripOperation(this.routeTripApi.serveStop(trip.id, Number(stopId)), 'errors.updateTrip');

  /**
   * Confirms the arrival of a passenger.
   * @param trip - Trip in progress.
   * @param studentId - Student identifier.
   * @returns True when the arrival was confirmed.
   */
  confirmArrival = (trip: Trip, studentId: string): Promise<boolean> =>
    this.runTripOperation(this.routeTripApi.confirmArrival(trip.id, Number(studentId)), 'errors.updateTrip');

  // Helpers

  /**
   * Loads a route collection into the state.
   * @param request - Route collection request.
   * @param fallback - Error key used when the request fails.
   */
  private loadRoutesFrom = (request: Observable<Route[]>, fallback: string): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: routes => {
        this.routesSignal.set(routes);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, fallback));
        this.loadingSignal.set(false);
      }
    });
  };

  /**
   * Runs a trip mutation and stores the returned trip.
   * @param request - Trip request.
   * @param fallback - Error key used when the request fails.
   * @returns True when the operation succeeded.
   */
  private runTripOperation = async (request: Observable<Trip>, fallback: string): Promise<boolean> => {
    this.tripsLoadingSignal.set(true);
    this.tripsErrorSignal.set(null);
    try {
      const trip = await firstValueFrom(request);
      this.tripsSignal.update(trips => trips.some(current => current.id === trip.id)
        ? trips.map(current => current.id === trip.id ? trip : current)
        : [...trips, trip]);
      return true;
    } catch (error) {
      this.tripsErrorSignal.set(this.formatError(error, fallback));
      return false;
    } finally {
      this.tripsLoadingSignal.set(false);
    }
  };

  /**
   * Rejects a trip operation that breaks a business rule.
   * @param key - Error key.
   * @returns Always false.
   */
  private rejectTrip = (key: string): boolean => {
    this.tripsErrorSignal.set(key);
    return false;
  };

  /**
   * Replaces a route in the state.
   * @param route - Route returned by the API.
   */
  private replaceRoute = (route: Route): void => {
    this.routesSignal.update(routes => routes.map(current => current.id === route.id ? route : current));
  };

  /**
   * Normalizes unknown errors into an i18n key.
   * @param error - Source error.
   * @param fallback - Key used when the error carries no HTTP information.
   * @returns Translation key.
   */
  private formatError = (error: unknown, fallback: string): string => toErrorMessageKey(error, fallback);
}
