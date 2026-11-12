import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SubscriptionsAndBillingStore } from '../../../application/subscriptions-and-billing.store';

@Component({
  selector: 'app-subscription-list',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './subscription-list.html',
  styleUrl: './subscription-list.css',
})
export class SubscriptionList {
  readonly store = inject(SubscriptionsAndBillingStore);

  readonly currentSubscriptions = computed(() =>
    this.store
      .subscriptions()
      .filter(
        (subscription) => subscription.status === 'ACTIVE' || subscription.status === 'SUSPENDED',
      ),
  );

  private readonly router = inject(Router);

  showCancelConfirmation = false;
  pendingCancellationId: number | null = null;

  getPlanName(planId: string): string {
    const plan = this.store.plans().find((plan) => plan.id === Number(planId));

    return plan?.name ?? 'Plan no disponible';
  }

  editSubscription(id: number): void {
    void this.router.navigate(['/driver/plans/subscriptions', id, 'edit']);
  }

  requestCancellation(id: number): void {
    this.pendingCancellationId = id;
    this.showCancelConfirmation = true;
  }

  confirmCancellation(): void {
    if (this.pendingCancellationId === null) {
      return;
    }

    this.store.deleteSubscription(this.pendingCancellationId);

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
