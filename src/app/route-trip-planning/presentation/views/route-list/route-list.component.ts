import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouteTripStore } from '../../../application/route-trip.store';
import { Route } from '../../../domain/model/route.entity';

type RouteFilter = 'ALL' | 'CONFIGURABLE' | 'PUBLISHED';

@Component({
  selector: 'app-route-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './route-list.component.html',
  styleUrl: './route-list.component.css',
})
export class RouteListComponent {
  readonly store = inject(RouteTripStore);
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
      case 'PUBLISHED': return 'Publicada';
      case 'DRAFT': return 'Borrador';
      case 'CONFIGURABLE': return 'Configurable';
      case 'SCHEDULED': return 'Programada';
      default: return route.status || 'Por configurar';
    }
  }

  shiftLabel(route: Route): string { return route.shift === 'AFTERNOON' ? 'Tarde' : 'Mañana'; }
  isPublished(route: Route): boolean { return route.status.toUpperCase() === 'PUBLISHED'; }

  navigateToNew(): void { void this.router.navigate(['/routes/new']); }
  editRoute(id: number): void { void this.router.navigate(['/routes', id, 'edit']); }

  deleteRoute(id: number): void {
    if (window.confirm('¿Eliminar esta ruta? Esta acción afecta los datos de la API conectada.')) {
      this.store.deleteRoute(id);
    }
  }
}
