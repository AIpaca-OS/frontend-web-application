import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { VehicleCredentialStore } from '../../../application/vehicle-credential.store';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.css',
})
export class VehicleListComponent {
  private dialog = inject(MatDialog);
  @ViewChild('confirmDialog') confirmDialogTemplate!: TemplateRef<any>;

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

  /*
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

   */

  editVehicle(id: number): void {
    this.router.navigate(['vehicles', id, 'edit']);
  }

  deleteVehicle(id: number): void {
    if (!this.confirmDialogTemplate) return;
    this.dialog
      .open(this.confirmDialogTemplate, {
        width: '420px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.store.deleteVehicle(id);
        }
      });
  }
  navigateToNew(): void {
    this.router.navigate(['vehicles', 'new']);
  }
}
