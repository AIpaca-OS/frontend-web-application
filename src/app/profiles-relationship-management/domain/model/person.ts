import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Represents the common personal information shared by
 * person-based entities within the
 * Profiles & Relationship Management bounded context.
 *
 * @remarks
 * This class is abstract and is not intended to be instantiated directly.
 * It provides shared identity and name-related behavior for entities such as
 * students, tutors, and drivers.
 */
export abstract class Person implements BaseEntity {

  /**
   * The unique identifier of the person.
   */
  readonly #id: number;

  /**
   * The person's first name.
   */
  #firstName: string;

  /**
   * The person's last name.
   */
  #lastName: string;

  /**
   * Initializes the common properties of a person.
   *
   * @param props - Properties required to initialize the person.
   * @param props.id - Unique identifier of the person.
   * @param props.firstName - Person's first name.
   * @param props.lastName - Person's last name.
   *
   * @remarks
   * Leading and trailing whitespace is removed from
   * `firstName` and `lastName` during initialization.
   */
  protected constructor(props: { id: number; firstName: string; lastName: string }) {
    this.#id = props.id;
    this.#firstName = props.firstName.trim();
    this.#lastName = props.lastName.trim();
  }

  /**
   * Gets the unique identifier of the person.
   * @returns The person's identifier.
   */
  get id(): number {
    return this.#id;
  }

  /**
   * Gets the person's first name.
   * @returns The first name.
   */
  get firstName(): string {
    return this.#firstName;
  }

  /**
   * Updates the person's first name.
   * @param value - The new first name.
   */
  set firstName(value: string) {
    this.#firstName = value.trim();
  }

  /**
   * Gets the person's last name.
   * @returns The last name.
   */
  get lastName(): string {
    return this.#lastName;
  }

  /**
   * Updates the person's last name.
   * @param value - The new last name.
   */
  set lastName(value: string) {
    this.#lastName = value.trim();
  }

  /**
   * Gets the person's complete name.
   * @returns The concatenation of the first name and last name,
   * separated by a single space.
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
