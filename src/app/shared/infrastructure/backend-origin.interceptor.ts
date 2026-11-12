import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    rumboConfig?: { apiOrigin?: string };
  }
}

/** Spring Boot REST calls use the deployed origin; other URLs are unchanged. */
export const backendOriginInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/v1/')) return next(request);

  const origin = window.rumboConfig?.apiOrigin?.trim() || environment.apiOrigin;
  return next(origin ? request.clone({ url: origin.replace(/\/+$/, '') + request.url }) : request);
};
