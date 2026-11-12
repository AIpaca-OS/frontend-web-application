import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Defines the supported profile types within the
 * Profiles & Relationship Management bounded context.
 */
export enum ProfileType {
  TUTOR = 'TUTOR',
  DRIVER = 'DRIVER',
}

/**
 * Represents a profile resource exchanged with the API.
 *
 * @remarks
 * A profile can represent either a tutor or a driver.
 * The {@link ProfileType} property determines the corresponding
 * domain entity that must be created by the assembler.
 */
export interface ProfileResource extends BaseResource {
  /**
   * Unique identifier of the profile.
   */
  id: number;

  /**
   * Identifier of the account associated with the profile.
   */
  accountId: number;

  /**
   * Profile owner's first name.
   */
  firstName: string;

  /**
   * Profile owner's last name.
   */
  lastName: string;

  /**
   * Profile owner's phone number.
   *
   * @remarks
   * The value can be `null` when no phone number has been provided.
   */
  phoneNumber: string | null;

  /**
   * Indicates whether the profile belongs to a tutor or a driver.
   */
  profileType: ProfileType;
}

/**
 * Represents the response returned by the profiles collection endpoint.
 */
export interface ProfileResponse extends BaseResponse {
  /**
   * Collection of profiles contained in the response.
   */
  profiles: ProfileResource[];
}
