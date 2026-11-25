import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';

import { BaseApi } from '../../shared/infrastructure/base-api';
import { Plan } from '../domain/model/plan.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { BillingDemoSession } from './billing-demo-session';

interface BackendPlan {
  id: number;
  name: string;
  description: string;
  referencePrice: number;
  active: boolean;
}

interface BackendSubscription {
  id: number;
  driverId: number;
  planId: number;
  status: string;
  startDate: string;
  endDate: string | null;
  active: boolean;
  vehicleLimit: number | null;
}

/**
 * Plans: public Spring Boot catalog backed by Render PostgreSQL.
 * Demo subscriptions: isolated signed sessions, persisted in the same PostgreSQL.
 * Real /api/v1/subscriptions remain protected pending verified driver IAM.
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionsAndBillingApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly demo = inject(BillingDemoSession);
  private readonly plansUrl = '/api/v1/plans';
  private readonly subscriptionsUrl = '/api/v1/billing-demo/subscriptions';

  getPlans(): Observable<Plan[]> {
    return this.http.get<BackendPlan[]>(this.plansUrl).pipe(
      map(plans => plans.map(plan => this.fromBackendPlan(plan))),
      catchError(this.handleBackendError('No se pudieron cargar los planes')),
    );
  }

  getPlan(id: number): Observable<Plan> {
    return this.http.get<BackendPlan>(`${this.plansUrl}/${id}`).pipe(
      map(plan => this.fromBackendPlan(plan)),
      catchError(this.handleBackendError('No se pudo cargar el plan')),
    );
  }

  createPlan(_plan: Plan): Observable<Plan> {
    return throwError(() => new Error('Crear planes no está disponible para conductores.'));
  }

  updatePlan(_plan: Plan): Observable<Plan> {
    return throwError(() => new Error('Editar planes no está disponible para conductores.'));
  }

  deletePlan(_id: number): Observable<void> {
    return throwError(() => new Error('Eliminar planes no está disponible para conductores.'));
  }

  getSubscriptions(): Observable<Subscription[]> {
    return this.demo.token().pipe(
      switchMap(token => this.http.get<BackendSubscription[]>(this.subscriptionsUrl, {
        headers: this.demo.headers(token),
      })),
      map(rows => rows.map(row => this.fromBackendSubscription(row))),
      catchError(this.handleBackendError('No se pudieron cargar las suscripciones')),
    );
  }

  getSubscription(id: number): Observable<Subscription> {
    return this.getSubscriptions().pipe(
      map(rows => {
        const found = rows.find(row => row.id === id);
        if (!found) throw new Error('No se encontró la suscripción.');
        return found;
      }),
    );
  }

  createSubscription(subscription: Subscription): Observable<Subscription> {
    return this.demo.token().pipe(
      switchMap(token => this.http.post<BackendSubscription>(this.subscriptionsUrl, {
        planId: Number(subscription.planId),
      }, { headers: this.demo.headers(token) })),
      map(resource => this.fromBackendSubscription(resource)),
      catchError(this.handleBackendError('No se pudo activar la suscripción')),
    );
  }

  updateSubscription(subscription: Subscription): Observable<Subscription> {
    return this.demo.token().pipe(
      switchMap(token => this.http.patch<BackendSubscription>(
        `${this.subscriptionsUrl}/${subscription.id}/plan`,
        { planId: Number(subscription.planId) },
        { headers: this.demo.headers(token) },
      )),
      map(resource => this.fromBackendSubscription(resource)),
      catchError(this.handleBackendError('No se pudo cambiar el plan')),
    );
  }

  changeSubscriptionStatus(id: number, status: 'ACTIVE' | 'SUSPENDED'): Observable<Subscription> {
    return this.demo.token().pipe(
      switchMap(token => this.http.patch<BackendSubscription>(
        `${this.subscriptionsUrl}/${id}/status`,
        { status },
        { headers: this.demo.headers(token) },
      )),
      map(resource => this.fromBackendSubscription(resource)),
      catchError(this.handleBackendError('No se pudo cambiar el estado')),
    );
  }

  deleteSubscription(id: number): Observable<void> {
    return this.demo.token().pipe(
      switchMap(token => this.http.patch<BackendSubscription>(
        `${this.subscriptionsUrl}/${id}/cancel`,
        {},
        { headers: this.demo.headers(token) },
      )),
      map(() => undefined),
      catchError(this.handleBackendError('No se pudo cancelar la suscripción')),
    );
  }

  private fromBackendPlan(resource: BackendPlan): Plan {
    return new Plan({
      id: resource.id,
      name: resource.name,
      description: resource.description,
      referencePrice: Number(resource.referencePrice),
      active: resource.active,
    });
  }

  private fromBackendSubscription(resource: BackendSubscription): Subscription {
    return new Subscription({
      id: resource.id,
      driverId: String(resource.driverId),
      planId: String(resource.planId),
      status: resource.status,
      startDate: resource.startDate,
      endDate: resource.endDate,
      vehicleLimit: resource.vehicleLimit,
      paymentStatus: 'NOT_APPLICABLE',
      paymentAmount: 0,
    });
  }

  private handleBackendError(operation: string) {
    return (error: unknown): Observable<never> => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          return throwError(() => new Error(
            `${operation}: problema de conexión o CORS con el backend de Render.`,
          ));
        }
        if (error.status === 401 || error.status === 403) {
          this.demo.clear();
          return throwError(() => new Error(
            `${operation}: la sesión de demostración venció. Recarga e inténtalo nuevamente.`,
          ));
        }
        if (error.status === 404 || error.status === 503) {
          return throwError(() => new Error(
            `${operation}: la demostración de Billing no está habilitada en Render (HTTP ${error.status}).`,
          ));
        }
        return throwError(() => new Error(
          `${operation}: respuesta HTTP ${error.status} de Spring Boot.`,
        ));
      }
      return throwError(() => error);
    };
  }
}
