import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DelayForm } from '../../views/delay-form/delay-form';
import { IncidentForm } from '../../views/incident-form/incident-form';

@Component({
  selector: 'app-quick-actions',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatDialogModule, TranslatePipe],
  templateUrl: './quick-actions.html',
  styleUrl: './quick-actions.css',
})
export class QuickActions {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  reportDelay(): void {
    this.dialog.open(DelayForm, { width: '520px' });
  }

  reportIncident(): void {
    this.dialog.open(IncidentForm, { width: '520px' });
  }

  configureRoute(): void {
    this.router.navigate(['/routes']).then();
  }
}
