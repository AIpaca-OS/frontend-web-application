import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ProfilesRelationshipStore } from '../../../../profiles-relationship-management/application/profiles-relationship-management-store';
import { RouteTripStore } from '../../../../route-trip-planning/application/route-trip.store';
import { Route } from '../../../../route-trip-planning/domain/model/route.entity';
import { Trip, TripPassenger } from '../../../../route-trip-planning/domain/model/trip.entity';

/** Read model shown to the tutor: one student on one published route. */
interface TutorJourney {
  key: string;
  studentName: string;
  route: Route;
  assignedStopId: string;
  assignedStopAddress: string;
  trip: Trip | null;
  passenger: TripPassenger | null;
}

/**
 * Published routes and latest trip state of the tutor's students.
 *
 * @remarks
 * Composed from published endpoints only: GET /students?tutorProfileId, GET /service-enrollments/students/{id},
 * GET /routes?driverProfileId and GET /trips?routeId.
 */
@Component({
  selector: 'app-tutor-current-trip',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <main class="trip">
      <header class="heading">
        <div>
          <p class="eyebrow">{{ 'tutorTrip.eyebrow' | translate }}</p>
          <h1>{{ 'tutorTrip.title' | translate }}</h1>
          <p>{{ 'tutorTrip.subtitle' | translate }}</p>
        </div>
        <button type="button" (click)="reload()" [disabled]="loading()">{{ 'tutorTrip.refresh' | translate }}</button>
      </header>
      @for (error of errors(); track error) {
        <p class="error" role="alert">{{ error | translate }}</p>
      }
      @if (loading()) {
        <p role="status">{{ 'tutorTrip.loading' | translate }}</p>
      } @else if (!journeys().length && !errors().length) {
        <section class="card">
          <h2>{{ 'tutorTrip.emptyTitle' | translate }}</h2>
          <p>{{ 'tutorTrip.emptyDescription' | translate }}</p>
          <a routerLink="/tutor/students">{{ 'tutorTrip.manageStudents' | translate }}</a>
        </section>
      }
      @for (journey of journeys(); track journey.key) {
        <article class="card">
          <div class="card-top">
            <div>
              <span class="student">{{ journey.studentName }}</span>
              <h2>{{ journey.route.name }}</h2>
              <p>{{ journey.route.code }} · {{ (journey.route.shift === 'MORNING' ? 'routes.form.morning' : 'routes.form.afternoon') | translate }}
                @if (journey.route.departureTime) { · {{ journey.route.departureTime }} }
              </p>
            </div>
            <span class="state" [class.arrived]="journey.passenger?.arrived">
              {{ stateKey(journey) | translate }}
            </span>
          </div>
          <p><strong>{{ 'tutorTrip.assignedStop' | translate }}:</strong> {{ journey.assignedStopAddress }}</p>
          @if (journey.trip; as trip) {
            <p><strong>{{ 'tutorTrip.registeredTrip' | translate }}:</strong> {{ trip.serviceDate }}
              · {{ 'trips.status.' + trip.status | translate }}</p>
          } @else {
            <p>{{ 'tutorTrip.noTrip' | translate }}</p>
          }
          <h3>{{ 'tutorTrip.itinerary' | translate }}</h3>
          <ol>
            @for (stop of journey.route.stops; track stop.position) {
              <li [class.my-stop]="stop.id === journey.assignedStopId">
                <span>{{ stop.address }}</span>
                @if (stop.id === journey.assignedStopId) { <strong>{{ 'tutorTrip.studentStop' | translate }}</strong> }
              </li>
            }
          </ol>
          @if (journey.passenger?.arrived) {
            <p class="confirmation" role="status">{{ 'tutorTrip.arrivalConfirmed' | translate }}</p>
          } @else if (journey.passenger?.stopServed) {
            <p class="confirmation">{{ 'tutorTrip.stopServed' | translate }}</p>
          }
        </article>
      }
      <a routerLink="/tutor/notifications">{{ 'tutorTrip.viewNotifications' | translate }}</a>
    </main>
  `,
  styles: [`
    .trip { box-sizing:border-box;width:100%;max-width:var(--rumbo-page-max-width);margin:0 auto;padding:var(--rumbo-page-padding); color:#143f34; display:grid; gap:18px; }
    .heading,.card-top { display:flex; justify-content:space-between; align-items:start; gap:20px; flex-wrap:wrap; }
    .eyebrow { font-size:12px; color:#19876c; font-weight:700; letter-spacing:.08em; text-transform:uppercase; margin:0; }
    h1 {font-size:28px;margin:8px 0;} h2{font-size:20px;margin:3px 0;}h3{font-size:15px;}
    p {font-size:13px; color:#556e64; line-height:1.6;}
    .card { border:1px solid #d8e7df; background:#fff; padding:22px; border-radius:14px; }
    .student {color:#12856b;font-size:13px;font-weight:750;}
    .state {background:#f1f4f0;color:#345449;padding:8px 12px;border-radius:100px;font-size:12px;font-weight:700;}
    .state.arrived,.confirmation {background:#e8f6ee;color:#12614d;padding:9px 12px;border-radius:10px;}
    ol {padding-left:26px;} li{padding:9px 6px;border-bottom:1px solid #edf0ec;font-size:13px;}
    li.my-stop {background:#e8f6ee;} li strong{margin-left:12px;color:#176f59;font-size:11px;}
    button {border:1px solid #19856a;border-radius:10px;background:#fff;color:#146d54;padding:10px 14px;cursor:pointer;}
    button:disabled{opacity:.5;}a{color:#137e65;font-weight:700;}
    .error{color:#ab302e;}
  `],
})
export class TutorCurrentTrip {
  private readonly profilesStore = inject(ProfilesRelationshipStore);
  private readonly routeTripStore = inject(RouteTripStore);
  private lastStudents = '';
  private lastDrivers = '';
  private lastRoutes = '';

  /** Driver profiles that accepted the transport of the tutor's students. */
  private readonly driverIds = computed(() => [...new Set(this.profilesStore.enrollments()
    .filter(enrollment => enrollment.status === 'ACCEPTED')
    .map(enrollment => enrollment.driverProfileId))].sort((a, b) => a - b));

  /** Published routes where a student of the tutor has an assigned stop. */
  readonly journeys = computed<TutorJourney[]>(() => {
    const result: TutorJourney[] = [];
    for (const student of this.profilesStore.students()) {
      for (const route of this.routeTripStore.routes()) {
        if (route.status.toUpperCase() !== 'PUBLISHED') continue;
        const stop = route.stops.find(item => (item.studentIds ?? []).includes(String(student.id)));
        if (!stop?.id) continue;
        const trip = this.routeTripStore.trips()
          .filter(item => String(item.routeId) === route.id && item.students.some(p => p.studentId === String(student.id)))
          .sort((a, b) => b.serviceDate.localeCompare(a.serviceDate))[0] ?? null;
        result.push({
          key: `${student.id}:${route.id}`,
          studentName: student.fullName,
          route,
          assignedStopId: stop.id,
          assignedStopAddress: stop.address,
          trip,
          passenger: trip?.students.find(p => p.studentId === String(student.id)) ?? null,
        });
      }
    }
    return result;
  });

  readonly loading = computed(() =>
    this.profilesStore.loading() || this.profilesStore.enrollmentsLoading() ||
    this.routeTripStore.loading() || this.routeTripStore.tripsLoading());

  readonly errors = computed(() => [
    this.profilesStore.error(), this.profilesStore.enrollmentsError(),
    this.routeTripStore.error(), this.routeTripStore.tripsError(),
  ].filter((key): key is string => Boolean(key)));

  /**
   * Chains the loads: students → enrollments → driver routes → trips.
   */
  constructor() {
    effect(() => {
      const ids = this.profilesStore.students().map(student => student.id);
      const key = ids.join(',');
      if (key && key !== this.lastStudents) {
        this.lastStudents = key;
        this.profilesStore.loadStudentEnrollments(ids);
      }
    });
    effect(() => {
      const ids = this.driverIds();
      const key = ids.join(',');
      if (key && key !== this.lastDrivers) {
        this.lastDrivers = key;
        this.routeTripStore.loadRoutesByDrivers(ids);
      }
    });
    effect(() => {
      const ids = [...new Set(this.journeys().map(journey => journey.route.id))];
      const key = ids.join(',');
      if (key && key !== this.lastRoutes) {
        this.lastRoutes = key;
        this.routeTripStore.loadTrips(ids);
      }
    });
  }

  /**
   * Builds the i18n key of the student's current state.
   * @param journey - Journey to describe.
   * @returns Translation key.
   */
  stateKey(journey: TutorJourney): string {
    const passenger = journey.passenger;
    if (!journey.trip || !passenger) return 'tutorTrip.state.published';
    if (passenger.arrived) return 'tutorTrip.state.arrived';
    if (passenger.absent) return 'tutorTrip.state.absent';
    if (passenger.stopServed) return 'tutorTrip.state.stopServed';
    return 'trips.status.' + journey.trip.status;
  }

  /** Reloads the whole chain. */
  reload(): void {
    this.lastDrivers = '';
    this.lastRoutes = '';
    const ids = this.profilesStore.students().map(student => student.id);
    if (ids.length) this.profilesStore.loadStudentEnrollments(ids);
  }
}
