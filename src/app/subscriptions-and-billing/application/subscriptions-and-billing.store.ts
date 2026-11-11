import { HttpErrorResponse } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  catchError,
  finalize,
  firstValueFrom,
  forkJoin,
  of,
  Subscription as RxSubscription,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';
import { Plan } from '../domain/model/plan.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionsAndBillingApi } from '../infrastructure/subscriptions-and-billing-api';

@Injectable({ providedIn: 'root' })
export class SubscriptionsAndBillingStore {
  private readonly api = inject(SubscriptionsAndBillingApi);
  private readonly session = inject(DemoRoleSession);
  private readonly plansSignal = signal<Plan[]>([]);
  private readonly subscriptionsSignal = signal<Subscription[]>([]);
  private refreshSubscription?: RxSubscription;

  readonly plans = this.plansSignal.asReadonly();
  readonly subscriptions = this.subscriptionsSignal.asReadonly();
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly plansError = signal<string | null>(null);
  readonly subscriptionsError = signal<string | null>(null);
  readonly activationError = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly driverId = computed(() =>
    this.session.role() === 'driver' ? environment.billingDemoDriverId : null,
  );
  readonly availablePlans = computed(() =>
    this.plans().filter(
      (plan) => plan.active && plan.billingPeriodMonths !== null && plan.billingPeriodMonths > 0,
    ),
  );
  readonly currentSubscription = computed(() =>
    this.subscriptions().find((subscription) => subscription.active),
  );

  constructor() {
    effect((onCleanup) => {
      this.driverId();
      this.plansSignal.set([]);
      this.subscriptionsSignal.set([]);
      this.notice.set(null);
      this.activationError.set(null);
      this.saving.set(false);
      this.reload();
      onCleanup(() => this.refreshSubscription?.unsubscribe());
    });
  }

  reload(): void {
    this.refreshSubscription?.unsubscribe();
    this.plansError.set(null);
    this.subscriptionsError.set(null);
    const driverId = this.driverId();
    if (driverId === null) {
      this.loading.set(false);
      this.subscriptionsError.set('billing.errors.session');
      return;
    }
    this.loading.set(true);
    this.refreshSubscription = forkJoin({
      plans: this.api.getPlans().pipe(
        catchError((error) => {
          this.plansError.set(this.errorKey(error));
          return of([] as Plan[]);
        }),
      ),
      subscriptions: this.api.getSubscriptions(driverId).pipe(
        catchError((error) => {
          this.subscriptionsError.set(this.errorKey(error));
          return of([] as Subscription[]);
        }),
      ),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ plans, subscriptions }) => {
        this.plansSignal.set(plans);
        this.subscriptionsSignal.set(subscriptions);
      });
  }

  async activatePlan(planId: number): Promise<boolean> {
    const driverId = this.driverId();
    if (this.saving() || driverId === null) return false;
    this.saving.set(true);
    this.activationError.set(null);
    this.notice.set(null);
    try {
      const result = await firstValueFrom(this.api.activateSubscription(driverId, planId));
      if (this.driverId() !== driverId) return false;
      this.subscriptionsSignal.update((subscriptions) =>
        [
          result.subscription,
          ...subscriptions.filter((subscription) => subscription.id !== result.subscription.id),
        ].sort((first, second) => second.id - first.id),
      );
      this.notice.set(result.created ? 'billing.activationCreated' : 'billing.activationExisting');
      return true;
    } catch (error) {
      if (this.driverId() === driverId) this.activationError.set(this.errorKey(error));
      return false;
    } finally {
      if (this.driverId() === driverId) this.saving.set(false);
    }
  }

  private errorKey(error: unknown): string {
    const messages: Record<number, string> = {
      0: 'billing.errors.connection',
      400: 'billing.errors.invalid',
      401: 'billing.errors.session',
      403: 'billing.errors.permission',
      404: 'billing.errors.missing',
      409: 'billing.errors.unavailable',
    };
    return error instanceof HttpErrorResponse
      ? (messages[error.status] ?? 'billing.errors.unexpected')
      : 'billing.errors.unexpected';
  }
}
