import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DemoRoleSession } from '../application/demo-role-session.service';
import { environment } from '../../../environments/environment';

/** Only the local backend receives demo-role headers. Never forward these to MockAPI. */
export const localDemoRoleInterceptor: HttpInterceptorFn = (request,next) => {
  if (environment.production || !request.url.startsWith('/api/v1/')) return next(request);
  const role=inject(DemoRoleSession).role();
  return next(role ? request.clone({setHeaders:{'X-Rumbo-Demo-Role':role}}) : request);
};
