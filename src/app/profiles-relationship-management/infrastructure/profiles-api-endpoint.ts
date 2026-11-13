import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Tutor } from '../domain/model/tutor.entity';
import { Driver } from '../domain/model/driver.entity';
import { ProfileResource, ProfileResponse } from './profiles-response';
import { ProfileAssembler } from './profile-assembler';
import { environment } from '../../../environments/environment';

/** ProfilesController supports lookup by ID/account, create and contact PATCH. */
export class ProfilesApiEndpoint extends BaseApiEndpoint<Tutor | Driver, ProfileResource, ProfileResponse, ProfileAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderProfilesEndpointPath}`, new ProfileAssembler());
  }

  getByAccount(accountId: number): Observable<Tutor | Driver> {
    return this.http.get<ProfileResource>(`${this.endpointUrl}/by-account/${accountId}`).pipe(
      map(row => this.assembler.toEntityFromResource(row)),
      catchError(this.handleError('Failed to fetch account profile')),
    );
  }

  override create(entity: Tutor | Driver): Observable<Tutor | Driver> {
    const resource = this.assembler.toResourceFromEntity(entity);
    return this.http.post<ProfileResource>(this.endpointUrl, {
      accountId: entity.accountId, profileType: resource.profileType,
      firstName: entity.firstName, lastName: entity.lastName, phoneNumber: entity.phoneNumber,
    }).pipe(map(row => this.assembler.toEntityFromResource(row)),
      catchError(this.handleError('Failed to create profile')));
  }

  override update(entity: Tutor | Driver, id: number): Observable<Tutor | Driver> {
    return this.http.patch<ProfileResource>(`${this.endpointUrl}/${id}/contact`, {
      phoneNumber: entity.phoneNumber,
    }).pipe(map(row => this.assembler.toEntityFromResource(row)),
      catchError(this.handleError('Failed to update profile contact')));
  }
}
