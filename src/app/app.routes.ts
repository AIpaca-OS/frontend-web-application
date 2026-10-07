import { Routes } from '@angular/router';
import { Home } from './shared/presentation/views/home/home';

const pageNotFound=()=>import('./shared/presentation/views/page-not-found/page-not-found').then(m=>m.PageNotFound);
const notificationRoutes=()=>import('./alerting/presentation/views/alerting.routes').then(m=>m.alertingRoutes);
const vehiclesRoutes=()=>import('./vehicle-credential-management/presentation/views/vehicle-credential.routes').then(m=>m.vehicleCredentialRoutes);
const routeTripRoutes=()=>import('./route-trip-planning/presentation/views/route-trip.routes').then(m=>m.routeTripRoutes);
const profilesRoutes=()=>import('./profiles-relationship-management/presentation/profiles.routes').then(m=>m.profilesRoutes);
const subscriptionsRoutes=()=>import('./subscriptions-and-billing/presentation/subscriptions-and-billing.routes').then(m=>m.subscriptionsAndBillingRoutes);
const termsPage=()=>import('./shared/presentation/views/legal/terms').then(m=>m.TermsPage);
const privacyPage=()=>import('./shared/presentation/views/legal/privacy').then(m=>m.PrivacyPage);
const baseTitle='Rumbo';

export const routes: Routes = [
  { path:'home', component:Home, title:`${baseTitle} - Home` },
  { path:'routes', loadChildren:routeTripRoutes, title:`${baseTitle} - Routes` },
  { path:'vehicles', loadChildren:vehiclesRoutes, title:`${baseTitle} - Vehicles` },
  { path:'students', loadChildren:profilesRoutes, title:`${baseTitle} - Students` },
  { path:'notifications', loadChildren:notificationRoutes, title:`${baseTitle} - Notifications` },
  { path:'subscriptions-and-billing', loadChildren:subscriptionsRoutes, title:`${baseTitle} - Billing` },
  { path:'subscription', redirectTo:'/subscriptions-and-billing', pathMatch:'full' },
  { path:'terms', loadComponent:termsPage, title:`${baseTitle} - Terms` },
  { path:'privacy', loadComponent:privacyPage, title:`${baseTitle} - Privacy` },
  { path:'', redirectTo:'/home', pathMatch:'full' },
  { path:'**', loadComponent:pageNotFound, title:`${baseTitle} - Page Not Found` },
];
