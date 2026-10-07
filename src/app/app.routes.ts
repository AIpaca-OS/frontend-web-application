import { Routes } from '@angular/router';

const subscriptionsAndBillingRoutes = () =>
  import('./subscriptions-and-billing/presentation/subscriptions-and-billing.routes').then(
    (m) => m.subscriptionsAndBillingRoutes,
  );

export const routes: Routes = [
  {
    path: 'subscriptions-and-billing',
    loadChildren: subscriptionsAndBillingRoutes,
  },
];
