import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SubscriptionAssembler } from './subscription-assembler';
import { SubscriptionResource } from './subscriptions-response';

export class SubscriptionsApiEndpoint {
  private readonly endpointUrl = `${environment.billingBasePath}${environment.billingSubscriptionsEndpointPath}`;
  private readonly assembler = new SubscriptionAssembler();

  constructor(private readonly http: HttpClient) {}

  getByDriverId(driverId: number) {
    return this.http
      .get<SubscriptionResource[]>(this.endpointUrl, { params: { driverId } })
      .pipe(
        map((resources) =>
          resources.map((resource) => this.assembler.toEntityFromResource(resource)),
        ),
      );
  }

  activate(driverId: number, planId: number) {
    return this.http
      .post<SubscriptionResource>(this.endpointUrl, { driverId, planId }, { observe: 'response' })
      .pipe(
        map((response) => {
          if (!response.body) throw new Error('Subscription response is empty');
          return {
            subscription: this.assembler.toEntityFromResource(response.body),
            created: response.status === 201,
          };
        }),
      );
  }
}
