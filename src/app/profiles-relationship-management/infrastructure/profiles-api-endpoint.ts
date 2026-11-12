import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Tutor } from '../domain/model/tutor.entity';
import { Driver } from '../domain/model/driver.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { ProfileAssembler } from './profile-assembler';
import { ProfileResource, ProfileResponse } from './profiles-response';

/**
 * Provides HTTP access to profile-related operations within the
 * Profiles & Relationship Management bounded context.
 *
 * @remarks
 * The profiles endpoint manages both Tutor and Driver profiles.
 * Each profile resource includes a profile type that allows
 * {@link ProfileAssembler} to determine the corresponding domain entity.
 *
 * This endpoint extends {@link BaseApiEndpoint} to reuse the common
 * CRUD operations defined for API resources.
 */
export class ProfilesApiEndpoint extends BaseApiEndpoint<
  Tutor | Driver,
  ProfileResource,
  ProfileResponse,
  ProfileAssembler
> {

  /**
   * Creates a new {@link ProfilesApiEndpoint} instance.
   *
   * @param http - Angular HTTP client used to perform requests
   * against the profiles REST resource.
   */
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.profilesApiBaseUrl}${environment.profilesProfilesEndpointPath}`,
      new ProfileAssembler(),
    );
  }
}
