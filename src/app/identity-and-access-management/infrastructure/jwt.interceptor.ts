import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DemoRoleSession } from '../application/demo-role-session.service';

/** Never send the JWT to MockAPI or other third-party services. */
export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/v1/')) return next(request);
  const token = inject(DemoRoleSession).token();
  return next(token
    ? request.clone({ setHeaders: { Authorization: 'Bearer ' + token } })
    : request);
};
