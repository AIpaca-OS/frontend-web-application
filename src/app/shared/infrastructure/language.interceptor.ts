import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '../../../environments/environment';

/**
 * Sends the active UI language to the Rumbo platform so that Spring Boot
 * returns localized Problem Detail messages.
 *
 * @remarks
 * `Accept-Language` is a CORS-safelisted header, so it does not add a preflight request.
 *
 * @param request - Outgoing HTTP request.
 * @param next - Next handler in the interceptor chain.
 * @returns Stream with the HTTP event.
 */
export const languageInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.platformProviderApiBaseUrl)) return next(request);
  const language = inject(TranslateService).getCurrentLang() || 'en';
  return next(request.clone({setHeaders: {'Accept-Language': language}}));
};
