import { Routes } from '@angular/router';

const planList = () => import('./views/plan-list/plan-list').then((m) => m.PlanList);

const subscriptionList = () =>
  import('./views/subscription-list/subscription-list').then((m) => m.SubscriptionList);

const subscriptionForm = () =>
  import('./views/subscription-form/subscription-form').then((m) => m.SubscriptionForm);

export const subscriptionsAndBillingRoutes: Routes = [
  {
    path: 'plans',
    loadComponent: planList,
  },
  {
    path: 'subscriptions',
    loadComponent: subscriptionList,
  },
  {
    path: 'subscriptions/new',
    loadComponent: subscriptionForm,
  },
  {
    path: 'subscriptions/:id/edit',
    loadComponent: subscriptionForm,
  },
  {
    path: '',
    redirectTo: 'plans',
    pathMatch: 'full',
  },
];
