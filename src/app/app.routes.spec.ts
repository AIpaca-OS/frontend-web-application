import { routes } from './app.routes';

describe('Rumbo role navigation', () => {
  const driver = routes.find(route => route.path === 'driver');
  const tutor = routes.find(route => route.path === 'tutor');

  it('registers working Home and Settings paths for both roles', () => {
    expect(driver?.children?.some(route => route.path === 'home' && !!route.loadComponent)).toBe(true);
    expect(driver?.children?.some(route => route.path === 'configuration' && !!route.loadComponent)).toBe(true);
    expect(tutor?.children?.some(route => route.path === 'home' && !!route.loadComponent)).toBe(true);
    expect(tutor?.children?.some(route => route.path === 'configuration' && !!route.loadComponent)).toBe(true);
  });

  it('separates tutor current trip from driver route planning', () => {
    const driverRoutes = driver?.children?.find(route => route.path === 'routes');
    const tutorTrip = tutor?.children?.find(route => route.path === 'current-trip');

    expect(driverRoutes?.loadChildren).toBeDefined();
    expect(tutorTrip?.loadComponent).toBeDefined();
    expect(tutorTrip?.loadChildren).toBeUndefined();
  });

  it('protects tutor and driver previews with separate role guards', () => {
    expect(driver?.canActivate?.length).toBe(1);
    expect(tutor?.canActivate?.length).toBe(1);
  });

  it('registers independent Settings components for each role', () => {
    const driverSettings = driver?.children?.find(route => route.path === 'configuration');
    const tutorSettings = tutor?.children?.find(route => route.path === 'configuration');

    expect(driverSettings?.loadComponent).toBeDefined();
    expect(tutorSettings?.loadComponent).toBeDefined();
    expect(driverSettings?.loadComponent).not.toBe(tutorSettings?.loadComponent);
  });

  it('does not expose unfiltered vehicle CRUD under the tutor role', () => {
    const tutorPaths = tutor?.children?.map(route => route.path);
    expect(tutorPaths).not.toContain('vehicles');
    expect(driver?.children?.some(route => route.path === 'vehicles')).toBe(true);
  });

  it('does not expose route editing under the tutor role', () => {
    const tutorPaths = tutor?.children?.map(route => route.path);
    expect(tutorPaths).not.toContain('routes');
  });
});
