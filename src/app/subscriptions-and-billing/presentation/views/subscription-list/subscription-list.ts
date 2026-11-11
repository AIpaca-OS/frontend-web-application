import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { SubscriptionsAndBillingStore } from '../../../application/subscriptions-and-billing.store';

@Component({
  selector: 'app-subscription-list',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './subscription-list.html',
  styleUrls: ['../../billing.css', './subscription-list.css'],
})
export class SubscriptionList {
  readonly store = inject(SubscriptionsAndBillingStore);

  getPlanName(planId: number): string {
    return this.store.plans().find((plan) => plan.id === planId)?.name ?? `#${planId}`;
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'billing.status.active',
      EXPIRED: 'billing.status.expired',
      PENDING: 'billing.status.pending',
      SUSPENDED: 'billing.status.suspended',
      CANCELLED: 'billing.status.cancelled',
    };
    return labels[status] ?? status;
  }
}
