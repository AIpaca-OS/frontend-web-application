import { computed, DestroyRef, inject, Injectable, Signal, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

import { Plan } from '../domain/model/plan.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionsAndBillingApi } from '../infrastructure/subscriptions-and-billing-api';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionsAndBillingStore {
  private readonly api = inject(SubscriptionsAndBillingApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly plansSignal = signal<Plan[]>([]);
  readonly plans = this.plansSignal.asReadonly();

  private readonly subscriptionsSignal = signal<Subscription[]>([]);
  readonly subscriptions = this.subscriptionsSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  private readonly plansLoadingSignal = signal<boolean>(false);
  readonly plansLoading = this.plansLoadingSignal.asReadonly();
  private readonly subscriptionsLoadingSignal = signal<boolean>(false);
  readonly subscriptionsLoading = this.subscriptionsLoadingSignal.asReadonly();
  readonly loading = computed(
    () => this.loadingSignal() || this.plansLoading() || this.subscriptionsLoading(),
  );

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();
  private readonly plansErrorSignal = signal<string | null>(null);
  readonly plansError = this.plansErrorSignal.asReadonly();

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

    this.api.createPlan(plan).subscribe({
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

    this.api.updatePlan(plan).subscribe({
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

    this.api.deletePlan(id).subscribe({
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

  async addSubscription(subscription: Subscription): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      // Do not retry POST: an activation could have been persisted already.
      const created = await firstValueFrom(this.api.createSubscription(subscription));
      this.subscriptionsSignal.update((rows) => [
        ...rows.filter((row) => row.id !== created.id),
        created,
      ]);
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'Failed to activate subscription'));
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updateSubscription(subscription: Subscription): Promise<boolean> {
    this.errorSignal.set(null);

    const current = this.subscriptionsSignal().find((item) => item.id === subscription.id);

    if (!current) {
      this.errorSignal.set('No se encontró la suscripción.');
      return false;
    }

    const planChanged = current.planId !== subscription.planId;
    const statusChanged = current.status !== subscription.status;

    if (planChanged && statusChanged) {
      this.errorSignal.set(
        'Cambia primero el plan o el estado. Guarda cada operación por separado.',
      );
      return false;
    }

    if (!planChanged && !statusChanged) {
      return true;
    }

    this.loadingSignal.set(true);

    try {
      if (planChanged) {
        await firstValueFrom(this.api.updateSubscription(subscription));
      } else {
        const status = subscription.status;

        if (status !== 'ACTIVE' && status !== 'SUSPENDED') {
          throw new Error('Estado de suscripción no admitido');
        }

        await firstValueFrom(this.api.changeSubscriptionStatus(subscription.id, status));
      }

      this.refreshSubscriptions();
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'No se pudo actualizar la suscripción'));
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  deleteSubscription(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api.deleteSubscription(id).subscribe({
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

  reloadPlans(): void {
    this.loadPlans();
  }

  private loadPlans(): void {
    this.plansLoadingSignal.set(true);
    this.plansErrorSignal.set(null);

    this.api
      .getPlans()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (plans) => {
          this.plansSignal.set(plans);
          this.plansLoadingSignal.set(false);
        },
        error: (error) => {
          this.plansErrorSignal.set(this.formatError(error, 'Failed to load plans'));
          this.plansLoadingSignal.set(false);
        },
      });
  }

  private loadSubscriptions(): void {
    this.subscriptionsLoadingSignal.set(true);
    this.errorSignal.set(null);

    this.api
      .getSubscriptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (subscriptions) => {
          this.subscriptionsSignal.set(subscriptions);
          this.subscriptionsLoadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(this.formatError(error, 'Failed to load subscriptions'));
          this.subscriptionsLoadingSignal.set(false);
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

  refreshSubscriptions(): void {
    this.loadSubscriptions();
  }
}
