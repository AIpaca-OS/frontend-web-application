import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'vehicles',
    loadChildren: () =>
      import('./vehicle-credential-management/presentation/views/vehicle-credential.routes').then(
        (m) => m.vehicleCredentialRoutes,
      ),
  },
];
