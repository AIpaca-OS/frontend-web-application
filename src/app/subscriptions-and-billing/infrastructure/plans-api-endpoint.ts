import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Plan } from '../domain/model/plan.entity';
import { PlanResource, PlansResponse } from './plans-response';
import { PlanAssembler } from './plan-assembler';
import { environment } from '../../../environments/environment';

/**
 * Endpoint client for the Plans resource.
 *
 * @remarks
 * Supported operations (Swagger): GET /plans, GET /plans/{id} and POST /plans. There is no PUT or DELETE.
 */
export class PlansApiEndpoint extends BaseApiEndpoint<Plan, PlanResource, PlansResponse, PlanAssembler> {
  /**
   * Creates an instance of PlansApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderPlansEndpointPath}`, new PlanAssembler());
  }

  /**
   * Creates a plan (CreatePlanRequest).
   * @param plan - Plan to create.
   * @returns Stream with the created plan.
   */
  override create(plan: Plan): Observable<Plan> {
    const { id: _id, ...request } = this.assembler.toResourceFromEntity(plan);
    return this.http.post<PlanResource>(this.endpointUrl, request).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create plan'))
    );
  }
}
