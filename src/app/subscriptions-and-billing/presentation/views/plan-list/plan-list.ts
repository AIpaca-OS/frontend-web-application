import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';

import { SubscriptionsAndBillingStore } from '../../../application/subscriptions-and-billing.store';

@Component({
  selector: 'app-plan-list',
  imports: [MatButtonModule, MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './plan-list.html',
  styleUrl: './plan-list.css',
})
export class PlanList {
  readonly store = inject(SubscriptionsAndBillingStore);
  readonly availablePlans = computed(() => this.store.plans().filter(plan => plan.active));

  reload(): void { this.store.reloadPlans(); }
  private readonly router = inject(Router);

  selectPlan(planId: number): void {
    void this.router.navigate(['/driver/plans/subscriptions/new'], {
      queryParams: { planId },
    });
  }

  goToSubscriptions(): void {
    this.router.navigate(['driver', 'plans', 'subscriptions']).then();
  }
}
