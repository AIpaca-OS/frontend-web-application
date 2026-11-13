import { computed, DestroyRef, inject, Injectable, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

import { Plan } from '../domain/model/plan.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionsAndBillingApi } from '../infrastructure/subscriptions-and-billing-api';
import { toErrorMessageKey } from '../../shared/infrastructure/api-error';

/**
 * Holds Subscriptions & Billing application state and coordinates plan and subscription operations.
 *
 * @remarks
 * `error` and `plansError` contain i18n keys that the views render with TranslatePipe.
 */
@Injectable({
  providedIn: 'root',
})
export class SubscriptionsAndBillingStore {
  private readonly api = inject(SubscriptionsAndBillingApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly plansSignal = signal<Plan[]>([]);

  /**
   * Readonly signal for the plan catalog.
   */
  readonly plans = this.plansSignal.asReadonly();

  private readonly subscriptionsSignal = signal<Subscription[]>([]);

  /**
   * Readonly signal for the subscriptions of the acting driver.
   */
  readonly subscriptions = this.subscriptionsSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  private readonly plansLoadingSignal = signal<boolean>(false);

  /**
   * Readonly signal indicating if the plan catalog is loading.
   */
  readonly plansLoading = this.plansLoadingSignal.asReadonly();

  private readonly subscriptionsLoadingSignal = signal<boolean>(false);

  /**
   * Readonly signal indicating if the subscriptions are loading.
   */
  readonly subscriptionsLoading = this.subscriptionsLoadingSignal.asReadonly();

  /**
   * Computed signal indicating if any operation is in progress.
   */
  readonly loading = computed(() => this.loadingSignal() || this.plansLoading() || this.subscriptionsLoading());

  private readonly errorSignal = signal<string | null>(null);

  /**
   * Readonly signal for the current subscription error (i18n key).
   */
  readonly error = this.errorSignal.asReadonly();

  private readonly plansErrorSignal = signal<string | null>(null);

  /**
   * Readonly signal for the current plan catalog error (i18n key).
   */
  readonly plansError = this.plansErrorSignal.asReadonly();

  /**
   * Computed signal for the count of plans.
   */
  readonly planCount = computed(() => this.plans().length);

  /**
   * Computed signal for the count of subscriptions.
   */
  readonly subscriptionCount = computed(() => this.subscriptions().length);

  /**
   * Creates an instance of SubscriptionsAndBillingStore and loads initial data.
   */
  constructor() {
    this.loadPlans();
    this.loadSubscriptions();
  }

  /**
   * Selects a plan by identifier.
   * @param id - Plan identifier.
   * @returns Reactive selection for the requested plan.
   */
  getPlanById = (id: number): Signal<Plan | undefined> =>
    computed(() => this.plans().find(plan => plan.id === id));

  /**
   * Selects a subscription by identifier.
   * @param id - Subscription identifier.
   * @returns Reactive selection for the requested subscription.
   */
  getSubscriptionById = (id: number): Signal<Subscription | undefined> =>
    computed(() => this.subscriptions().find(subscription => subscription.id === id));

  /**
   * Reloads the plan catalog.
   */
  reloadPlans = (): void => this.loadPlans();

  /**
   * Activates a subscription for the acting driver.
   * @param subscription - Subscription with the selected plan.
   * @returns True when the subscription was activated.
   */
  addSubscription = async (subscription: Subscription): Promise<boolean> => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      // A POST must not be retried automatically: an activation could have been persisted already.
      const created = await firstValueFrom(this.api.createSubscription(subscription));
      this.subscriptionsSignal.update(subscriptions => [...subscriptions.filter(row => row.id !== created.id), created]);
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'errors.activateSubscription'));
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  };

  /**
   * Applies the change made to a subscription: plan change (PATCH /plan) or status change (PATCH /status).
   * @param subscription - Subscription with the desired plan and status.
   * @returns True when the change was saved.
   */
  updateSubscription = async (subscription: Subscription): Promise<boolean> => {
    const previous = this.subscriptions().find(current => current.id === subscription.id);
    const request = !previous || previous.planId !== subscription.planId
      ? this.api.changeSubscriptionPlan(subscription)
      : previous.status !== subscription.status
        ? this.api.changeSubscriptionStatus(subscription)
        : null;
    if (!request) {
      this.errorSignal.set('errors.noSubscriptionChanges');
      return false;
    }
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const updated = await firstValueFrom(request);
      this.subscriptionsSignal.update(subscriptions =>
        subscriptions.map(current => current.id === updated.id ? updated : current));
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'errors.updateSubscription'));
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  };

  /**
   * Cancels a subscription.
   * @param id - Subscription identifier.
   */
  cancelSubscription = (id: number): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.cancelSubscription(id).subscribe({
      next: cancelled => {
        this.subscriptionsSignal.update(subscriptions =>
          subscriptions.map(current => current.id === cancelled.id ? cancelled : current));
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'errors.cancelSubscription'));
        this.loadingSignal.set(false);
      }
    });
  };

  /**
   * Loads the plan catalog.
   */
  private loadPlans = (): void => {
    this.plansLoadingSignal.set(true);
    this.plansErrorSignal.set(null);
    this.api.getPlans().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: plans => {
        this.plansSignal.set(plans);
        this.plansLoadingSignal.set(false);
      },
      error: error => {
        this.plansErrorSignal.set(this.formatError(error, 'errors.loadPlans'));
        this.plansLoadingSignal.set(false);
      }
    });
  };

  /**
   * Loads the subscriptions of the acting driver.
   */
  private loadSubscriptions = (): void => {
    this.subscriptionsLoadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.getSubscriptions().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: subscriptions => {
        this.subscriptionsSignal.set(subscriptions);
        this.subscriptionsLoadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'errors.loadSubscriptions'));
        this.subscriptionsLoadingSignal.set(false);
      }
    });
  };

  /**
   * Normalizes unknown errors into an i18n key.
   * @param error - Source error.
   * @param fallback - Key used when the error carries no HTTP information.
   * @returns Translation key.
   */
  private formatError = (error: unknown, fallback: string): string => toErrorMessageKey(error, fallback);
}
