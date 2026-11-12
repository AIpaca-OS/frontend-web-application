import { Injectable } from '@angular/core';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { AssignmentInputResource, EligibleStudentResource, RoutesApiEndpoint } from './routes-api-endpoint';
import { Route } from '../domain/model/route.entity';
import { TranslateService } from '@ngx-translate/core';
import { RouteSchedule } from '../domain/model/route-schedule.entity';

@Injectable({
  providedIn: 'root',
})
export class RoutesApi extends BaseApi {
  private readonly endpoint: RoutesApiEndpoint;

  constructor(http: HttpClient, translate: TranslateService, session: DemoRoleSession) {
    super();
    this.endpoint = new RoutesApiEndpoint(http, () => translate.getCurrentLang() ?? 'en', session);
  }

  getRoutes(): Observable<Route[]> {
    return this.endpoint.getAll();
  }

  getRouteById(id: string): Observable<Route> {
    return this.endpoint.getById(id);
  }

  createRoute(route: Route): Observable<Route> {
    return this.endpoint.create(route);
  }

  updateRoute(route: Route): Observable<Route> {
    return this.endpoint.update(route, route.id);
  }

  updateSchedule(id: string, schedule: RouteSchedule[], confirm: boolean): Observable<Route> {
    return this.endpoint.updateSchedule(id, schedule, confirm);
  }

  getEligibleStudents(): Observable<EligibleStudentResource[]> {
    return this.endpoint.getEligibleStudents();
  }

  replaceAssignments(id: string, assignments: AssignmentInputResource[]): Observable<Route> {
    return this.endpoint.replaceAssignments(id, assignments);
  }

  publishRoute(id: string): Observable<Route> {
    return this.endpoint.publish(id);
  }

  deleteRoute(id: string): Observable<void> {
    return this.endpoint.delete(id);
  }
}
