import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslatePipe } from '@ngx-translate/core';
import { IncidentsStore } from '../../../application/incidents-store';
import { Delay } from '../../../domain/model/delay.entity';

/**
 * Dialog that reports a delay of a trip (POST /delays).
 */
@Component({
  selector: 'app-delay-form',
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatInputModule, MatFormFieldModule, TranslatePipe],
  templateUrl: './delay-form.html',
  styleUrl: './delay-form.css'
})
export class DelayForm {
  readonly store = inject(IncidentsStore);
  private readonly dialogRef = inject(MatDialogRef<DelayForm>);
  private readonly data = inject<{ tripId?: number } | null>(MAT_DIALOG_DATA, { optional: true });
  readonly tripFromContext = Boolean(this.data?.tripId);
  tripId = this.data?.tripId ?? 0;
  magnitude = '5';
  cause = '';

  /**
   * Reports the delay and closes the dialog once the backend confirms it.
   */
  async submit(): Promise<void> {
    if (this.tripId <= 0 || !this.cause.trim()) return;
    const saved = await this.store.addDelay(new Delay({
      id: 0, tripId: this.tripId, cause: this.cause.trim(), priority: 'ACTIVE',
      magnitude: this.magnitude, studentIds: [], createdAt: new Date().toISOString(),
    }));
    if (saved) this.dialogRef.close(true);
  }
}
