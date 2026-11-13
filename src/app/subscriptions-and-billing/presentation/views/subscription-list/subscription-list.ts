import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { SubscriptionsAndBillingStore } from '../../../application/subscriptions-and-billing.store';

@Component({
  selector: 'app-subscription-list',
  imports: [MatButtonModule, MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './subscription-list.html',
  styleUrl: './subscription-list.css',
})
export class SubscriptionList {
  readonly store = inject(SubscriptionsAndBillingStore);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  showCancelConfirmation = false;
  pendingCancellationId: number | null = null;

  getPlanName(planId: string): string {
    const plan = this.store.plans().find((plan) => plan.id === Number(planId));

    return plan?.name ?? this.translate.instant('billing.subscriptions.planUnavailable');
  }

  /**
   * Returns the reference price of the subscribed plan (the API has no payment records).
   * @param planId - Plan identifier.
   * @returns Plan reference price, or 0 when the plan is not in the catalog.
   */
  getPlanPrice(planId: string): number {
    return this.store.plans().find(plan => plan.id === Number(planId))?.referencePrice ?? 0;
  }

  editSubscription(id: number): void {
    this.router.navigate(['/driver/plans/subscriptions', id, 'edit']).then();
  }

  requestCancellation(id: number): void {
    this.pendingCancellationId = id;
    this.showCancelConfirmation = true;
  }

  confirmCancellation(): void {
    if (this.pendingCancellationId === null) {
      return;
    }

    this.store.cancelSubscription(this.pendingCancellationId);

    this.closeCancellation();
  }

  closeCancellation(): void {
    this.showCancelConfirmation = false;
    this.pendingCancellationId = null;
  }

  goToPlans(): void {
    void this.router.navigateByUrl('/driver/plans');
  }
}
