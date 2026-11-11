import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { SubscriptionsAndBillingStore } from '../../../application/subscriptions-and-billing.store';

@Component({
  selector: 'app-subscription-form',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './subscription-form.html',
  styleUrls: ['../../billing.css', './subscription-form.css'],
})
export class SubscriptionForm {
  readonly store = inject(SubscriptionsAndBillingStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly planControl = new FormControl<number | null>(null, Validators.required);
  private readonly selectedId = toSignal(this.planControl.valueChanges, { initialValue: null });
  readonly selectedPlan = computed(() =>
    this.store.availablePlans().find((plan) => plan.id === this.selectedId()),
  );

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const planId = Number(params.get('planId'));
      if (Number.isSafeInteger(planId) && planId > 0) this.planControl.setValue(planId);
    });
  }

  async submit(): Promise<void> {
    const plan = this.selectedPlan();
    if (this.planControl.invalid || !plan || this.store.loading()) return;
    if (await this.store.activatePlan(plan.id)) {
      await this.router.navigate(['/driver/plans/subscriptions']);
    }
  }
}
