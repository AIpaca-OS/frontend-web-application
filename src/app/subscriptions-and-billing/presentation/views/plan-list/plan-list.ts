import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { SubscriptionsAndBillingStore } from '../../../application/subscriptions-and-billing.store';

@Component({
  selector: 'app-plan-list',
  imports: [
    CurrencyPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './plan-list.html',
  styleUrls: ['../../billing.css', './plan-list.css'],
})
export class PlanList {
  readonly store = inject(SubscriptionsAndBillingStore);
  private readonly router = inject(Router);

  isCurrentPlan(planId: number): boolean {
    return this.store
      .subscriptions()
      .some((subscription) => subscription.planId === planId && subscription.active);
  }

  selectPlan(planId: number): void {
    void this.router.navigate(['/driver/plans/subscriptions/new'], { queryParams: { planId } });
  }
}
