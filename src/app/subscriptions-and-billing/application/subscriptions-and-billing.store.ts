import { computed, inject, Injectable, Signal, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { retry } from 'rxjs';

import { Plan } from '../domain/model/plan.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionsAndBillingApi } from '../infrastructure/subscriptions-and-billing-api';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionsAndBillingStore {
  private readonly api = inject(SubscriptionsAndBillingApi);

  private readonly plansSignal = signal<Plan[]>([]);
  readonly plans = this.plansSignal.asReadonly();

  private readonly subscriptionsSignal = signal<Subscription[]>([]);
  readonly subscriptions = this.subscriptionsSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  readonly planCount = computed(() => this.plans().length);

  readonly subscriptionCount = computed(() => this.subscriptions().length);

  constructor() {
    this.loadPlans();
    this.loadSubscriptions();
  }

  getPlanById(id: number): Signal<Plan | undefined> {
    return computed(() => this.plans().find((plan) => plan.id === id));
  }

  getSubscriptionById(id: number): Signal<Subscription | undefined> {
    return computed(() => this.subscriptions().find((subscription) => subscription.id === id));
  }

  addPlan(plan: Plan): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api
      .createPlan(plan)
      .pipe(retry(2))
      .subscribe({
        next: (createdPlan) => {
          this.plansSignal.update((plans) => [...plans, createdPlan]);

          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to create plan'));

          this.loadingSignal.set(false);
        },
      });
  }

  updatePlan(plan: Plan): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api
      .updatePlan(plan)
      .pipe(retry(2))
      .subscribe({
        next: (updatedPlan) => {
          this.plansSignal.update((plans) =>
            plans.map((current) => (current.id === updatedPlan.id ? updatedPlan : current)),
          );

          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to update plan'));

          this.loadingSignal.set(false);
        },
      });
  }

  deletePlan(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api
      .deletePlan(id)
      .pipe(retry(2))
      .subscribe({
        next: () => {
          this.plansSignal.update((plans) => plans.filter((plan) => plan.id !== id));

          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to delete plan'));

          this.loadingSignal.set(false);
        },
      });
  }

  addSubscription(subscription: Subscription): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api
      .createSubscription(subscription)
      .pipe(retry(2))
      .subscribe({
        next: (createdSubscription) => {
          this.subscriptionsSignal.update((subscriptions) => [
            ...subscriptions,
            createdSubscription,
          ]);

          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to create subscription'));

          this.loadingSignal.set(false);
        },
      });
  }

  updateSubscription(subscription: Subscription): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api
      .updateSubscription(subscription)
      .pipe(retry(2))
      .subscribe({
        next: (updatedSubscription) => {
          this.subscriptionsSignal.update((subscriptions) =>
            subscriptions.map((current) =>
              current.id === updatedSubscription.id ? updatedSubscription : current,
            ),
          );

          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to update subscription'));

          this.loadingSignal.set(false);
        },
      });
  }

  deleteSubscription(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api
      .deleteSubscription(id)
      .pipe(retry(2))
      .subscribe({
        next: () => {
          this.subscriptionsSignal.update((subscriptions) =>
            subscriptions.filter((subscription) => subscription.id !== id),
          );

          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to delete subscription'));

          this.loadingSignal.set(false);
        },
      });
  }

  private loadPlans(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api
      .getPlans()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (plans) => {
          this.plansSignal.set(plans);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to load plans'));

          this.loadingSignal.set(false);
        },
      });
  }

  private loadSubscriptions(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api
      .getSubscriptions()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (subscriptions) => {
          this.subscriptionsSignal.set(subscriptions);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to load subscriptions'));

          this.loadingSignal.set(false);
        },
      });
  }

  private formatError(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found')
        ? `${fallback}: Not found`
        : error.message;
    }

    return fallback;
  }
}
