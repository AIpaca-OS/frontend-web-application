import { Component, effect, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { Subscription } from '../../../domain/model/subscription.entity';
import { SubscriptionsAndBillingStore } from '../../../application/subscriptions-and-billing.store';

@Component({
  selector: 'app-subscription-form',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './subscription-form.html',
  styleUrl: './subscription-form.css',
})
export class SubscriptionForm {
  readonly store = inject(SubscriptionsAndBillingStore);

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  subscriptionId: number | null = null;
  isEdit = false;

  form = this.fb.group({
    planId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    status: new FormControl('ACTIVE', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      this.subscriptionId = id ? Number(id) : null;
      this.isEdit = this.subscriptionId !== null;
    });

    this.route.queryParamMap.subscribe((params) => {
      const planId = params.get('planId');

      if (planId && !this.isEdit) {
        this.form.patchValue({
          planId,
        });
      }
    });

    effect(() => {
      if (!this.isEdit || this.subscriptionId === null) {
        return;
      }

      const subscription = this.store
        .subscriptions()
        .find((item) => item.id === this.subscriptionId);

      if (subscription) {
        this.form.patchValue({
          planId: subscription.planId,
          status: subscription.status,
        });
      }
    });
  }

  getSelectedPlan() {
    const planId = Number(this.form.controls.planId.value);

    return this.store.plans().find((plan) => plan.id === planId);
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const selectedPlan = this.getSelectedPlan();

    if (!selectedPlan) {
      return;
    }

    const currentSubscription =
      this.subscriptionId !== null
        ? this.store.subscriptions().find((item) => item.id === this.subscriptionId)
        : undefined;

    const subscription = new Subscription({
      id: this.subscriptionId ?? 0,
      driverId: currentSubscription?.driverId ?? '101',
      planId: this.form.controls.planId.value,
      status: this.form.controls.status.value,
      startDate: currentSubscription?.startDate ?? new Date().toISOString().slice(0, 10),
      paymentStatus: currentSubscription?.paymentStatus ?? 'PENDING',
      paymentAmount: selectedPlan.referencePrice,
    });

    if (this.isEdit) {
      this.store.updateSubscription(subscription);
    } else {
      this.store.addSubscription(subscription);
    }

    this.router.navigate(['subscriptions-and-billing', 'subscriptions']).then();
  }

  cancel(): void {
    this.router.navigate(['subscriptions-and-billing', 'plans']).then();
  }
}
