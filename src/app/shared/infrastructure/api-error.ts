import {HttpErrorResponse} from '@angular/common/http';

/**
 * Error raised by infrastructure endpoints that preserves the HTTP context
 * required by the application layer (status code, Problem Detail and error code).
 */
export class ApiError extends Error {
  /**
   * Creates an instance of ApiError.
   * @param message - Technical message that names the failed operation.
   * @param status - HTTP status code (0 when the browser could not reach the server).
   * @param detail - Localized `detail` returned by the Spring Boot Problem Detail, if any.
   * @param code - Business error code returned by the backend, if any.
   */
  constructor(
    message: string,
    readonly status: number,
    readonly detail: string | null = null,
    readonly code: string | null = null
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /**
   * Builds an ApiError from an Angular HTTP error.
   * @param operation - Name of the failed operation.
   * @param error - HTTP error returned by HttpClient.
   * @returns ApiError with the preserved HTTP information.
   */
  static fromHttpError(operation: string, error: HttpErrorResponse): ApiError {
    const body = error.error as { detail?: unknown; code?: unknown } | null;
    const detail = typeof body?.detail === 'string' ? body.detail : null;
    const code = typeof body?.code === 'string' ? body.code : null;
    let reason: string;
    if (error.status === 0) {
      reason = 'Network or CORS error';
    } else if (error.status === 404) {
      reason = 'Resource not found';
    } else if (error.error instanceof ErrorEvent) {
      reason = error.error.message;
    } else {
      reason = `${error.status} ${detail ?? error.statusText ?? 'Unexpected error'}`;
    }
    return new ApiError(`${operation}: ${reason}`, error.status, detail, code);
  }
}

/**
 * Translates any error into an i18n key that the presentation layer can render with TranslatePipe.
 *
 * @remarks
 * Status 0 is reported as a network/CORS problem, never as "server down".
 * Errors created with an `errors.*` message are already translation keys.
 *
 * @param error - Source error.
 * @param fallbackKey - Key used when the error carries no useful information.
 * @returns Translation key under the `errors` namespace.
 */
export const toErrorMessageKey = (error: unknown, fallbackKey = 'errors.unexpected'): string => {
  if (error instanceof ApiError) {
    if (error.status === 0) return 'errors.network';
    if (error.status === 400) return 'errors.badRequest';
    if (error.status === 401 || error.status === 403) return 'errors.unauthorized';
    if (error.status === 404) return 'errors.notFound';
    if (error.status === 409) return 'errors.conflict';
    if (error.status === 422) return 'errors.unprocessable';
    if (error.status === 503) return 'errors.unavailable';
    if (error.status >= 500) return 'errors.server';
    return fallbackKey;
  }
  if (error instanceof Error && error.message.startsWith('errors.')) return error.message;
  return fallbackKey;
};
