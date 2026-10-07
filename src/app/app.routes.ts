import { Routes } from '@angular/router';
import { Home } from './shared/presentation/views/home/home';

const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFound);
const notificationRoutes = () =>
  import('./alerting/presentation/views/alerting.routes').then((m) => m.alertingRoutes);
const vehiclesRoutes = () =>
  import('./vehicle-credential-management/presentation/views/vehicle-credential.routes').then(
    (m) => m.vehicleCredentialRoutes);
const routePlanningRoutes = () =>
  import('./route-trip-planning/presentation/views/route-trip.routes').then(
    (m) => m.routeTripRoutes);
const baseTitle = 'Rumbo';

export const routes: Routes = [
  { path: 'home', component: Home, title: `${baseTitle} - Home` },
  { path: 'routes', loadChildren: routePlanningRoutes, title: `${baseTitle} - Routes` },
  { path: 'vehicles', loadChildren: vehiclesRoutes, title: `${baseTitle} - Vehicles` },
  { path: 'students', component: Home, title: `${baseTitle} - Home` },
  { path: 'notifications', loadChildren: notificationRoutes, title: `${baseTitle} - Notifications` },
  { path: 'subscription', component: Home, title: `${baseTitle} - Home` },
  { path: 'configuration', component: Home, title: `${baseTitle} - Home` },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: `${baseTitle} - Page Not Found` },
];
