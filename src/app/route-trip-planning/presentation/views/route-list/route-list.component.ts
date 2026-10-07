import { Component, computed, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouteTripStore } from '../../../application/route-trip.store';

@Component({
  selector: 'app-route-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
  ],
  templateUrl: './route-list.component.html',
  styleUrl: './route-list.component.css',
})
export class RouteListComponent {
  readonly store = inject(RouteTripStore);
  private readonly router = inject(Router);

  readonly displayedColumns = [
    'code',
    'name',
    'departureTime',
    'stopsCount',
    'status',
    'actions',
  ];

  readonly sort = viewChild(MatSort);
  readonly paginator = viewChild(MatPaginator);

  readonly dataSource = computed(() => {
    const source = new MatTableDataSource(this.store.routes());
    const sort = this.sort();
    const paginator = this.paginator();

    if (sort) source.sort = sort;
    if (paginator) source.paginator = paginator;

    return source;
  });

  navigateToNew(): void {
    this.router.navigate(['/routes/new']);
  }

  editRoute(id: number): void {
    this.router.navigate(['/routes', id, 'edit']);
  }

  deleteRoute(id: number): void {
    this.store.deleteRoute(id);
  }
}
