import { Routes } from '@angular/router';
import { RouteFormComponent } from './route-form/route-form.component';
import { RouteListComponent } from './route-list/route-list.component';
import { DriverTrips } from './driver-trips/driver-trips';

export const routeTripRoutes: Routes = [
  {
    path: '',
    component: RouteListComponent,
  },
  {
    path: 'new',
    component: RouteFormComponent,
  },
  {
    path: ':id/trips',
    component: DriverTrips,
  },
  {
    path: ':id/edit',
    component: RouteFormComponent,
  },
];
