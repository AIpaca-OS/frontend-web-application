import { Routes } from '@angular/router';
import { NotificationDashboard } from './notification-dashboard/notification-dashboard';

export const alertingRoutes: Routes = [
  {
    path: '',
    component: NotificationDashboard,
  },
];
