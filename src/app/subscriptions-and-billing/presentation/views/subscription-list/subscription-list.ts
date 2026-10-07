import { Component, inject } from '@angular/core';
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
  private readonly router = inject(Router);

  getPlanName(planId: string): string {
    const plan = this.store.plans().find((plan) => plan.id === Number(planId));

    return plan?.name ?? 'Plan no disponible';
  }

  editSubscription(id: number): void {
    this.router.navigate(['subscriptions-and-billing', 'subscriptions', id, 'edit']).then();
  }

  deleteSubscription(id: number): void {
    this.store.deleteSubscription(id);
  }

  goToPlans(): void {
    this.router.navigate(['subscriptions-and-billing', 'plans']).then();
  }
}
