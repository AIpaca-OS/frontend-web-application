import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SubscriptionsAndBillingStore } from '../../../application/subscriptions-and-billing.store';

@Component({
  selector: 'app-plan-list',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './plan-list.html',
  styleUrl: './plan-list.css',
})
export class PlanList {
  readonly store = inject(SubscriptionsAndBillingStore);
  private readonly router = inject(Router);

  selectPlan(planId: number): void {
    this.router
      .navigate(['subscriptions-and-billing', 'subscriptions', 'new'], {
        queryParams: { planId },
      })
      .then();
  }

  goToSubscriptions(): void {
    this.router.navigate(['subscriptions-and-billing', 'subscriptions']).then();
  }
}
