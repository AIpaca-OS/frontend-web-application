import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RouteTripStore } from '../../../application/route-trip.store';
import { Route } from '../../../domain/model/route.entity';

type RouteFilter = 'ALL' | 'CONFIGURABLE' | 'PUBLISHED';

@Component({
  selector: 'app-route-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './route-list.component.html',
  styleUrl: './route-list.component.css',
})
export class RouteListComponent {
  readonly store = inject(RouteTripStore);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  readonly search = signal('');
  readonly filter = signal<RouteFilter>('ALL');

  readonly filteredRoutes = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.store.routes().filter(route => {
      const statusMatches = this.filter() === 'ALL'
        || (this.filter() === 'PUBLISHED' && route.status.toUpperCase() === 'PUBLISHED')
        || (this.filter() === 'CONFIGURABLE' && route.status.toUpperCase() !== 'PUBLISHED');
      const textMatches = !term || [route.name, route.code, route.departureTime]
        .some(value => String(value ?? '').toLowerCase().includes(term));
      return statusMatches && textMatches;
    });
  });

  readonly publishedCount = computed(() =>
    this.store.routes().filter(route => route.status.toUpperCase() === 'PUBLISHED').length,
  );

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  setFilter(value: RouteFilter): void { this.filter.set(value); }

  statusLabel(route: Route): string {
    switch (route.status.toUpperCase()) {
      case 'PUBLISHED': return this.translate.instant('routes.list.published');
      case 'DRAFT': return this.translate.instant('routes.list.statusDraft');
      case 'CONFIGURABLE': return this.translate.instant('routes.list.statusConfigurable');
      case 'SCHEDULED': return this.translate.instant('routes.list.statusScheduled');
      default: return route.status || this.translate.instant('routes.list.configurable');
    }
  }

  shiftLabel(route: Route): string {
    return this.translate.instant(route.shift === 'AFTERNOON'
      ? 'routes.list.afternoon' : 'routes.list.morning');
  }
  isPublished(route: Route): boolean { return route.status.toUpperCase() === 'PUBLISHED'; }
  canPublish(route: Route): boolean {
    return !this.isPublished(route) && Boolean(route.vehicleId) && route.stops.length > 0 && route.scheduleConfirmed
      && route.schedule.length > 0 && route.stops.some(stop => Boolean(stop.studentId));
  }

  navigateToNew(): void { void this.router.navigate(['/routes/new']); }
  editRoute(id: string): void { void this.router.navigate(['/routes', id, 'edit']); }

  deleteRoute(id: string): void {
    if (window.confirm(this.translate.instant('routes.list.confirmDelete'))) {
      this.store.deleteRoute(id);
    }
  }

  publishRoute(id: string): void {
    void this.store.publishRoute(id);
  }
}
