import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {ApiError} from './api-error';

/**
 * Provides reusable HTTP error translation for infrastructure services
 * that cannot extend {@link BaseApiEndpoint}.
 */
export abstract class ErrorHandlingEnabledBaseType {
  /**
   * Creates an operation-specific HTTP error handler.
   * @param operation - Name of the failed operation.
   * @returns Function that transforms an {@link HttpErrorResponse} into a failed observable.
   */
  protected handleError = (operation: string) =>
    (error: HttpErrorResponse): Observable<never> =>
      throwError(() => error instanceof HttpErrorResponse ? ApiError.fromHttpError(operation, error) : error);
}
