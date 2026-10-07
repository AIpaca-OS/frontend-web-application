import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Tutor } from '../domain/model/tutor.entity';
import { Driver } from '../domain/model/driver.entity';
import { ProfileResource, ProfileResponse, ProfileType } from './profiles-response';

/**
 * Maps profile resources to and from Tutor and Driver domain entities.
 */
export class ProfileAssembler implements BaseAssembler<
  Tutor | Driver,
  ProfileResource,
  ProfileResponse
> {
  /**
   * Converts a ProfileResponse into an array of
   * Tutor or Driver domain entities.
   *
   * @param response - The API response containing profiles.
   * @returns An array of Tutor and Driver entities.
   */
  toEntitiesFromResponse = (response: ProfileResponse): (Tutor | Driver)[] =>
    response.profiles.map((resource) => this.toEntityFromResource(resource));

  /**
   * Converts a ProfileResource into its corresponding domain entity.
   *
   * @param resource - Profile resource to convert.
   * @returns A Tutor or Driver entity according to the profile type.
   * @throws Error if the profile type is not supported.
   */
  toEntityFromResource = (resource: ProfileResource): Tutor | Driver => {
    switch (resource.profileType) {
      case ProfileType.TUTOR:
        return new Tutor({
          id: resource.id,
          accountId: resource.accountId,
          firstName: resource.firstName,
          lastName: resource.lastName,
          phoneNumber: resource.phoneNumber,
        });

      case ProfileType.DRIVER:
        return new Driver({
          id: resource.id,
          accountId: resource.accountId,
          firstName: resource.firstName,
          lastName: resource.lastName,
          phoneNumber: resource.phoneNumber,
        });

      default:
        throw new Error(`Invalid profile type: ${resource.profileType}`);
    }
  };

  /**
   * Converts a Tutor or Driver entity into a ProfileResource.
   *
   * @param entity - Domain entity to convert.
   * @returns The converted ProfileResource.
   * @throws Error if the entity type is not supported.
   */
  toResourceFromEntity = (entity: Tutor | Driver): ProfileResource => {
    if (entity instanceof Tutor) {
      return {
        id: entity.id,
        accountId: entity.accountId,
        firstName: entity.firstName,
        lastName: entity.lastName,
        phoneNumber: entity.phoneNumber,
        profileType: ProfileType.TUTOR,
      };
    }

    if (entity instanceof Driver) {
      return {
        id: entity.id,
        accountId: entity.accountId,
        firstName: entity.firstName,
        lastName: entity.lastName,
        phoneNumber: entity.phoneNumber,
        profileType: ProfileType.DRIVER,
      };
    }

    throw new Error('Unsupported profile entity');
  };
}
