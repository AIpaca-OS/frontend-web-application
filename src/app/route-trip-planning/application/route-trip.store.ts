import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { retry } from 'rxjs';
import { Route } from '../domain/model/route.entity';
import { RoutesApi } from '../infrastructure/routes-api';

@Injectable({
  providedIn: 'root',
})
export class RouteTripStore {
  private readonly routesApi = inject(RoutesApi);

  private readonly routesSignal = signal<Route[]>([]);
  readonly routes = this.routesSignal.asReadonly();

  private readonly loadingSignal = signal(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  readonly routeCount = computed(() => this.routes().length);

  constructor() {
    this.loadRoutes();
  }

  private formatError(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }

  loadRoutes(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.routesApi
      .getRoutes()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (routes) => {
          this.routesSignal.set(routes);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to load routes'));
          this.loadingSignal.set(false);
        },
      });
  }

  getRouteById(id: number): Signal<Route | undefined> {
    return computed(() => this.routes().find((route) => route.id === id));
  }

  addRoute(route: Route): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.routesApi
      .createRoute(route)
      .pipe(retry(2))
      .subscribe({
        next: (created) => {
          this.routesSignal.update((routes) => [...routes, created]);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to create route'));
          this.loadingSignal.set(false);
        },
      });
  }

  updateRoute(route: Route): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.routesApi
      .updateRoute(route)
      .pipe(retry(2))
      .subscribe({
        next: (updated) => {
          this.routesSignal.update((routes) =>
            routes.map((current) => (current.id === updated.id ? updated : current)),
          );
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to update route'));
          this.loadingSignal.set(false);
        },
      });
  }

  deleteRoute(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.routesApi
      .deleteRoute(id)
      .pipe(retry(2))
      .subscribe({
        next: () => {
          this.routesSignal.update((routes) => routes.filter((route) => route.id !== id));
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to delete route'));
          this.loadingSignal.set(false);
        },
      });
  }
}
