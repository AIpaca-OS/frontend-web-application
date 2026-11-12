import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    rumboConfig?: { apiOrigin?: string };
  }
}

/** Resolve Spring URLs only. External provider calls and frontend assets keep their own origin. */
export const backendOriginInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/v1/')) return next(request);

  const origin = window.rumboConfig?.apiOrigin?.trim() || environment.apiOrigin;
  return next(origin ? request.clone({ url: origin.replace(/\/+$/, '') + request.url }) : request);
};
