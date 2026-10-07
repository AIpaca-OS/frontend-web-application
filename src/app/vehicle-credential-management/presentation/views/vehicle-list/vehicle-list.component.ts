import { Component, computed, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { VehicleCredentialStore } from '../../../application/vehicle-credential.store';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.css',
})
export class VehicleListComponent {
  readonly store = inject(VehicleCredentialStore);
  protected router = inject(Router);

  displayedColumns: string[] = [
    'id',
    'licensePlate',
    'brand',
    'model',
    'capacity',
    'year',
    'status',
    'actions',
  ];

  readonly sort = viewChild(MatSort);
  readonly paginator = viewChild(MatPaginator);

  readonly dataSource = computed(() => {
    const source = new MatTableDataSource(this.store.vehicles());
    const sort = this.sort();
    if (sort) source.sort = sort;
    const paginator = this.paginator();
    if (paginator) source.paginator = paginator;
    return source;
  });

  editVehicle(id: number): void {
    this.router.navigate(['vehicles', id, 'edit']);
  }

  deleteVehicle(id: number): void {
    this.store.deleteVehicle(id);
  }

  navigateToNew(): void {
    this.router.navigate(['vehicles', 'new']);
  }
}
