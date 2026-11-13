import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RouteTripStore } from '../../../application/route-trip.store';
import { Trip, TripPassenger } from '../../../domain/model/trip.entity';
import { DelayForm } from '../../../../incident/presentation/views/delay-form/delay-form';
import { IncidentForm } from '../../../../incident/presentation/views/incident-form/incident-form';

/**
 * Trip management of a published route: planning, start, served stops, arrivals and completion.
 */
@Component({
  selector: 'app-driver-trips',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe, MatDialogModule],
  template: `
    <main class="trip-management">
      <a routerLink="/driver/routes">{{ 'trips.back' | translate }}</a>
      <h1>{{ 'trips.title' | translate }}</h1>
      @if (route(); as currentRoute) {
        <p><strong>{{ currentRoute.name }}</strong> · {{ currentRoute.code }}</p>
        <p>{{ 'trips.days' | translate }}: {{ scheduleText() }}</p>
      }
      <section class="panel">
        <h2>{{ 'trips.planTitle' | translate }}</h2>
        <p>{{ 'trips.planHint' | translate }}</p>
        <div class="inline">
          <label for="tripDate">{{ 'trips.date' | translate }}</label>
          <input id="tripDate" name="tripDate" type="date" [(ngModel)]="serviceDate" />
          <button type="button" [disabled]="store.tripsLoading() || !serviceDate || !route()" (click)="plan()">
            {{ 'trips.plan' | translate }}
          </button>
        </div>
      </section>
      @if (store.tripsError()) { <p class="error" role="alert">{{ store.tripsError()! | translate }}</p> }
      @if (message()) { <p class="success" role="status">{{ message()! | translate }}</p> }
      <button type="button" (click)="reload()" [disabled]="store.tripsLoading()">{{ 'trips.refresh' | translate }}</button>
      @if (store.tripsLoading()) { <p role="status">{{ 'common.loading' | translate }}</p> }
      @for (trip of trips(); track trip.id) {
        <article class="panel">
          <div class="header">
            <h2>{{ 'trips.tripOf' | translate: { date: trip.serviceDate } }}</h2>
            <span class="pill">{{ 'trips.status.' + trip.status | translate }}</span>
          </div>
          <div class="buttons">
            @if (trip.status === 'SCHEDULED') {
              <button type="button" [disabled]="store.tripsLoading()" (click)="start(trip)">
                {{ 'trips.start' | translate }}
              </button>
            }
            @if (trip.status === 'SCHEDULED' || trip.status === 'IN_PROGRESS') {
              <button type="button" (click)="reportDelay(trip)">{{ 'quickActions.reportDelay' | translate }}</button>
              <button type="button" (click)="reportIncident(trip)">{{ 'quickActions.reportIncident' | translate }}</button>
            }
          </div>
          @for (passenger of trip.students; track passenger.studentId) {
            <div class="student">
              <div>
                <strong>{{ 'profiles.enrollments.studentReference' | translate: { id: passenger.studentId } }}</strong>
                <p>{{ 'trips.stop' | translate: { position: passenger.stopPosition } }} · {{ passenger.stopAddress }}</p>
                <p>{{ 'trips.passengerStatus' | translate }}: {{ passengerState(passenger) | translate }}</p>
              </div>
              @if (trip.status === 'IN_PROGRESS') {
                <div class="buttons">
                  @if (!passenger.stopServed && !passenger.absent) {
                    <button type="button" [disabled]="store.tripsLoading()" (click)="serve(trip, passenger)">
                      {{ 'trips.serveStop' | translate }}
                    </button>
                  }
                  @if (passenger.stopServed && !passenger.arrived && !passenger.absent) {
                    <button type="button" class="primary" [disabled]="store.tripsLoading()"
                      (click)="confirmArrival(trip, passenger)">
                      {{ 'trips.confirmArrival' | translate }}
                    </button>
                  }
                </div>
              }
            </div>
          }
          @if (trip.status === 'IN_PROGRESS') {
            <button type="button" [disabled]="store.tripsLoading()" (click)="complete(trip)">
              {{ 'trips.complete' | translate }}
            </button>
          }
        </article>
      } @empty {
        @if (!store.tripsLoading()) { <p>{{ 'trips.empty' | translate }}</p> }
      }
    </main>
  `,
  styles: [`
    .trip-management{box-sizing:border-box;width:100%;max-width:var(--rumbo-page-max-width);margin:0 auto;padding:var(--rumbo-page-padding);color:#19493a;display:grid;gap:16px;}
    h1{font-size:29px;margin:0;}h2{font-size:19px;margin:4px 0 12px;}p{font-size:13px;color:#587268;}
    .panel{background:#fff;border:1px solid #dae7df;border-radius:14px;padding:22px;}
    .inline,.buttons,.header{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
    .header{justify-content:space-between;}
    input{padding:9px;border:1px solid #b4cfc2;border-radius:9px;}
    button{border:1px solid #228a6e;border-radius:9px;padding:9px 12px;background:#fff;color:#175d49;cursor:pointer;justify-self:start;}
    button.primary{background:#229777;color:white;}button:disabled{opacity:.5;}
    a{color:#0e8266;font-size:13px;}
    .student{padding:14px 0;border-top:1px solid #e6eeea;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;}
    .pill{background:#e9f5ee;color:#126049;border-radius:20px;padding:7px 11px;font-size:12px;}
    .error{color:#a52d2a;}.success{color:#0d775b;}
  `],
})
export class DriverTrips implements OnInit {
  readonly store = inject(RouteTripStore);
  private readonly activated = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);
  private readonly routeId = this.activated.snapshot.paramMap.get('id') ?? '';
  readonly route = this.store.getRouteById(this.routeId);
  readonly trips = computed(() => this.store.getTripsByRouteId(this.routeId)());
  readonly message = signal<string | null>(null);
  serviceDate = new Date().toLocaleDateString('en-CA');

  ngOnInit(): void { this.reload(); }

  /** Weekly schedule rendered with translated weekday names. */
  scheduleText(): string {
    const schedule = this.route()?.schedule ?? [];
    return schedule.length
      ? schedule.map(day => `${this.translate.instant('routes.days.' + day.dayOfWeek)} ${day.departureTime}`).join(', ')
      : this.translate.instant('trips.noSchedule');
  }

  /**
   * Builds the i18n key of a passenger state.
   * @param passenger - Trip passenger.
   * @returns Translation key.
   */
  passengerState(passenger: TripPassenger): string {
    if (passenger.arrived) return 'trips.passenger.arrived';
    if (passenger.absent) return 'trips.passenger.absent';
    if (passenger.stopServed) return 'trips.passenger.served';
    return 'trips.passenger.pending';
  }

  /** Reloads the trips of the route. */
  reload(): void {
    this.message.set(null);
    this.store.loadTrips([this.routeId]);
  }

  /** Plans a trip for the selected date. */
  async plan(): Promise<void> {
    const route = this.route();
    if (!route || !this.serviceDate) return;
    await this.notify(this.store.planTrip(route, this.serviceDate), 'trips.planned');
  }

  /** Starts a scheduled trip. */
  async start(trip: Trip): Promise<void> { await this.notify(this.store.startTrip(trip), 'trips.started'); }

  /** Completes a trip in progress. */
  async complete(trip: Trip): Promise<void> { await this.notify(this.store.completeTrip(trip), 'trips.completed'); }

  /** Marks the stop of a passenger as served. */
  async serve(trip: Trip, passenger: TripPassenger): Promise<void> {
    await this.notify(this.store.serveStop(trip, passenger.stopId), 'trips.stopServed');
  }

  /** Confirms the arrival of a passenger. */
  async confirmArrival(trip: Trip, passenger: TripPassenger): Promise<void> {
    await this.notify(this.store.confirmArrival(trip, passenger.studentId), 'trips.arrivalConfirmed');
  }

  /** Opens the delay report for the trip (Incident Management). */
  reportDelay(trip: Trip): void {
    this.dialog.open(DelayForm, { width: '520px', data: { tripId: trip.id } });
  }

  /** Opens the incident report for the trip (Incident Management). */
  reportIncident(trip: Trip): void {
    this.dialog.open(IncidentForm, { width: '520px', data: { tripId: trip.id } });
  }

  /**
   * Shows a confirmation when the operation succeeds.
   * @param operation - Store operation.
   * @param key - Success message key.
   */
  private async notify(operation: Promise<boolean>, key: string): Promise<void> {
    this.message.set(null);
    if (await operation) this.message.set(key);
  }
}
