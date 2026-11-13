import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';
import { Route } from '../domain/model/route.entity';
import { RouteSchedule } from '../domain/model/route-schedule.entity';
import { Trip } from '../domain/model/trip.entity';
import { RoutesApiEndpoint } from './routes-api-endpoint';
import { TripsApiEndpoint } from './trips-api-endpoint';
import { AssignStudentResource } from './routes-response';

/**
 * Infrastructure facade for the Route & Trip Planning bounded context.
 */
@Injectable({ providedIn: 'root' })
export class RouteTripApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(DemoRoleSession);
  private readonly routesEndpoint = new RoutesApiEndpoint(this.http);
  private readonly tripsEndpoint = new TripsApiEndpoint(this.http);

  /**
   * Runs a request that needs the acting driver profile ID.
   * @param request - Request factory that receives the driver profile ID.
   * @returns Stream of the request, or an error stream with an i18n key.
   */
  private asDriver<T>(request: (driverProfileId: number) => Observable<T>): Observable<T> {
    const driverProfileId = this.session.role() === 'driver' ? this.session.profileId() : null;
    return driverProfileId ? request(driverProfileId) : throwError(() => new Error('errors.driverProfileRequired'));
  }

  // Routes

  /**
   * Retrieves the routes of the acting driver.
   * @returns Stream with the route collection.
   */
  getRoutes = (): Observable<Route[]> =>
    this.asDriver(driverProfileId => this.routesEndpoint.getByDriver(driverProfileId));

  /**
   * Retrieves the routes operated by the given drivers (used by tutors to follow their students).
   * @param driverProfileIds - Driver profile identifiers.
   * @returns Stream with the route collection.
   */
  getRoutesByDrivers = (driverProfileIds: number[]): Observable<Route[]> =>
    driverProfileIds.length
      ? forkJoin(driverProfileIds.map(id => this.routesEndpoint.getByDriver(id))).pipe(map(batches => batches.flat()))
      : of([]);

  /**
   * Retrieves a route by ID.
   * @param id - Route identifier.
   * @returns Stream with the route.
   */
  getRoute = (id: string): Observable<Route> => this.routesEndpoint.getById(id);

  /**
   * Creates a route owned by the acting driver.
   * @param route - Route to create.
   * @returns Stream with the created route.
   */
  createRoute = (route: Route): Observable<Route> =>
    this.asDriver(driverProfileId => this.routesEndpoint.create(route, driverProfileId));

  /**
   * Updates a route.
   * @param route - Route to update.
   * @returns Stream with the updated route.
   */
  updateRoute = (route: Route): Observable<Route> => this.routesEndpoint.update(route, route.id);

  /**
   * Configures the weekly schedule of a route.
   * @param id - Route identifier.
   * @param schedule - Service days.
   * @param confirm - Whether the schedule is confirmed.
   * @returns Stream with the updated route.
   */
  updateSchedule = (id: string, schedule: RouteSchedule[], confirm: boolean): Observable<Route> =>
    this.routesEndpoint.updateSchedule(id, schedule, confirm);

  /**
   * Replaces the student-to-stop assignments of a route.
   * @param id - Route identifier.
   * @param assignments - New assignments (string IDs from the UI entity).
   * @returns Stream with the updated route.
   */
  replaceAssignments = (id: string, assignments: Array<{ studentId: string; stopId: string }>): Observable<Route> =>
    this.routesEndpoint.replaceAssignments(id, assignments.map(assignment => ({
      studentId: Number(assignment.studentId), stopId: Number(assignment.stopId),
    }) as AssignStudentResource));

  /**
   * Publishes a route.
   * @param id - Route identifier.
   * @returns Stream with the published route.
   */
  publishRoute = (id: string): Observable<Route> => this.routesEndpoint.publish(id);

  /**
   * Deletes a route.
   * @param id - Route identifier.
   * @returns Completion stream.
   */
  deleteRoute = (id: string): Observable<void> => this.routesEndpoint.delete(id);

  // Trips

  /**
   * Retrieves the trips of a route.
   * @param routeId - Route identifier.
   * @returns Stream with the trip collection.
   */
  getTripsByRoute = (routeId: number): Observable<Trip[]> => this.tripsEndpoint.getByRoute(routeId);

  /**
   * Plans a trip for a published route of the acting driver, using the persisted stop assignments as passengers.
   * @param route - Published route with an assigned vehicle.
   * @param serviceDate - Service date (YYYY-MM-DD).
   * @returns Stream with the planned trip.
   */
  planTrip = (route: Route, serviceDate: string): Observable<Trip> =>
    this.asDriver(driverProfileId => this.routesEndpoint.getAssignments(route.id).pipe(
      switchMap(assignments => {
        const passengers = assignments.flatMap(assignment => {
          const stop = route.stops.find(item => item.id === String(assignment.stopId));
          return stop
            ? [{ studentId: assignment.studentId, stopId: assignment.stopId, stopPosition: stop.position, stopAddress: stop.address }]
            : [];
        });
        if (!passengers.length) return throwError(() => new Error('errors.tripWithoutPassengers'));
        return this.tripsEndpoint.plan({
          routeId: Number(route.id), driverProfileId, vehicleId: Number(route.vehicleId),
          date: serviceDate, shift: route.shift, passengers,
        });
      })));

  /**
   * Starts a scheduled trip.
   * @param id - Trip identifier.
   * @returns Stream with the updated trip.
   */
  startTrip = (id: number): Observable<Trip> => this.tripsEndpoint.changeStatus(id, 'start');

  /**
   * Completes a trip in progress.
   * @param id - Trip identifier.
   * @returns Stream with the updated trip.
   */
  completeTrip = (id: number): Observable<Trip> => this.tripsEndpoint.changeStatus(id, 'complete');

  /**
   * Marks a stop as served.
   * @param id - Trip identifier.
   * @param stopId - Stop identifier.
   * @returns Stream with the updated trip.
   */
  serveStop = (id: number, stopId: number): Observable<Trip> => this.tripsEndpoint.serveStop(id, stopId);

  /**
   * Confirms the arrival of a passenger.
   * @param id - Trip identifier.
   * @param studentId - Student identifier.
   * @returns Stream with the updated trip.
   */
  confirmArrival = (id: number, studentId: number): Observable<Trip> => this.tripsEndpoint.confirmArrival(id, studentId);
}
