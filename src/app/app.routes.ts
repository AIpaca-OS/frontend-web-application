import { Routes } from '@angular/router';
import { previewRoleGuard } from './identity-and-access-management/application/demo-role-session.service';

const pageNotFound=()=>import('./shared/presentation/views/page-not-found/page-not-found').then(m=>m.PageNotFound);
const notificationRoutes=()=>import('./alerting/presentation/views/alerting.routes').then(m=>m.alertingRoutes);
const vehiclesRoutes=()=>import('./vehicle-credential-management/presentation/views/vehicle-credential.routes').then(m=>m.vehicleCredentialRoutes);
const routeTripRoutes=()=>import('./route-trip-planning/presentation/views/route-trip.routes').then(m=>m.routeTripRoutes);
const profilesRoutes=()=>import('./profiles-relationship-management/presentation/profiles.routes').then(m=>m.profilesRoutes);
const driverEnrollments=()=>import('./profiles-relationship-management/presentation/views/driver-enrollments/driver-enrollments').then(m=>m.DriverEnrollmentsComponent);
const subscriptionsRoutes=()=>import('./subscriptions-and-billing/presentation/subscriptions-and-billing.routes').then(m=>m.subscriptionsAndBillingRoutes);
const termsPage=()=>import('./shared/presentation/views/legal/terms').then(m=>m.TermsPage);
const loginPage = () => import('./identity-and-access-management/presentation/views/login/login').then((m) => m.Login);
const privacyPage = () => import('./shared/presentation/views/legal/privacy').then((m) => m.PrivacyPage);
const tutorLayout = () => import('./shared/presentation/components/tutor-layout/tutor-layout').then((m) => m.TutorLayout);
const driverLayout = () => import('./shared/presentation/components/driver-layout/driver-layout').then((m) => m.DriverLayout);


const driverHome = () => import('./shared/presentation/views/role-dashboard/driver-home').then(m => m.DriverHome);
const tutorHome = () => import('./shared/presentation/views/role-dashboard/tutor-home').then(m => m.TutorHome);
const tutorCurrentTrip = () => import('./shared/presentation/views/role-dashboard/tutor-current-trip').then(m => m.TutorCurrentTrip);
const driverSettings = () => import('./shared/presentation/views/role-dashboard/driver-settings').then(m => m.DriverSettings);
const tutorSettings = () => import('./shared/presentation/views/role-dashboard/tutor-settings').then(m => m.TutorSettings);

const baseTitle='Rumbo';

export const routes: Routes = [
  {
    path: 'tutor',
    canActivate: [previewRoleGuard('tutor')],
    loadComponent: tutorLayout,
    children: [
      { path: 'home', loadComponent: tutorHome, title: `${baseTitle} - Home` },
      { path: 'current-trip', loadComponent: tutorCurrentTrip, title: `${baseTitle} - Current trip` },
      { path: 'configuration', loadComponent: tutorSettings, title: `${baseTitle} - Tutor settings` },
      { path: 'students', loadChildren: profilesRoutes, title: `${baseTitle} - Students` },
      {
        path: 'notifications',
        loadChildren: notificationRoutes,
        title: `${baseTitle} - Notifications`,
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'driver',
    canActivate: [previewRoleGuard('driver')],
    loadComponent: driverLayout,
    children: [
      { path: 'home', loadComponent: driverHome, title: `${baseTitle} - Home` },
      { path: 'configuration', loadComponent: driverSettings, title: `${baseTitle} - Driver settings` },
      { path: 'routes', loadChildren: routeTripRoutes, title: `${baseTitle} - Routes` },
      { path: 'vehicles', loadChildren: vehiclesRoutes, title: `${baseTitle} - Vehicles` },
      { path: 'students', loadComponent: driverEnrollments, title: `${baseTitle} - Student Enrollments` },
      {
        path: 'notifications',
        loadChildren: notificationRoutes,
        title: `${baseTitle} - Notifications`,
      },
      {
        path: 'plans',
        loadChildren: subscriptionsRoutes,
        title: `${baseTitle} - Plans`,
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: 'plans',
    loadComponent: () => import('./subscriptions-and-billing/presentation/views/plan-list/plan-list')
      .then(module => module.PlanList),
    data: { publicCatalog: true },
    title: `${baseTitle} - Planes disponibles`,
  },
  { path: 'terms', loadComponent: termsPage, title: `${baseTitle} - Terms` },
  { path: 'privacy', loadComponent: privacyPage, title: `${baseTitle} - Privacy` },
  { path: 'login', loadComponent: loginPage, title: `${baseTitle} - Login` },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: `${baseTitle} - Page Not Found` },
];
