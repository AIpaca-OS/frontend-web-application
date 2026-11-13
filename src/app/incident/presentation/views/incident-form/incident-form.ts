import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { IncidentsStore } from '../../../application/incidents-store';
import { Incident } from '../../../domain/model/incident.entity';

/**
 * Dialog that reports an incident of a trip (POST /incidents).
 */
@Component({
  selector: 'app-incident-form',
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatSelectModule, TranslatePipe],
  templateUrl: './incident-form.html',
  styleUrl: './incident-form.css'
})
export class IncidentForm {
  readonly store = inject(IncidentsStore);
  private readonly dialogRef = inject(MatDialogRef<IncidentForm>);
  private readonly data = inject<{ tripId?: number } | null>(MAT_DIALOG_DATA, { optional: true });
  /** Categories accepted by ReportIncidentRequest. */
  readonly categories = ['MECHANICAL_FAILURE', 'TRAFFIC_ACCIDENT', 'ROAD_BLOCKED', 'STUDENT_HEALTH', 'OTHER'];
  readonly tripFromContext = Boolean(this.data?.tripId);
  tripId = this.data?.tripId ?? 0;
  title = 'OTHER';
  message = '';

  /**
   * Reports the incident and closes the dialog once the backend confirms it.
   */
  async submit(): Promise<void> {
    if (this.tripId <= 0 || !this.message.trim()) return;
    const saved = await this.store.addIncident(new Incident({
      id: 0, tripId: this.tripId, title: this.title, message: this.message.trim(), priority: 'OPEN',
      studentIds: [], resolved: false, resolvedAt: '', createdAt: new Date().toISOString(),
    }));
    if (saved) this.dialogRef.close(true);
  }
}
