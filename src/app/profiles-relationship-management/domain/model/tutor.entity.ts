import { Person } from './person';

/**
 * Represents a tutor within the
 * Profiles & Relationship Management bounded context.
 *
 * @remarks
 * A tutor extends the common personal information provided by {@link Person}
 * and maintains a reference to the account associated with the tutor,
 * together with an optional phone number.
 */
export class Tutor extends Person {

  /**
   * Identifier of the account associated with the tutor.
   *
   * @remarks
   * This value references the tutor's account managed by the
   * Identity & Access Management bounded context.
   */
  readonly #accountId: number;

  /**
   * Tutor's phone number.
   *
   * @remarks
   * The value can be `null` when no phone number has been provided.
   */
  #phoneNumber: string | null;

  /**
   * Creates a new {@link Tutor} instance.
   *
   * @param props - Properties required to initialize the tutor.
   * @param props.id - Unique identifier of the tutor.
   * @param props.firstName - Tutor's first name.
   * @param props.lastName - Tutor's last name.
   * @param props.accountId - Identifier of the tutor's associated account.
   * @param props.phoneNumber - Tutor's phone number, or `null` if none is available.
   */
  constructor(props: {
    id: number;
    firstName: string;
    lastName: string;
    accountId: number;
    phoneNumber: string | null;
  }) {
    super({
      id: props.id,
      firstName: props.firstName,
      lastName: props.lastName,
    });

    this.#accountId = props.accountId;
    this.#phoneNumber = props.phoneNumber?.trim() || null;
  }

  /**
   * Gets the identifier of the account associated with the tutor.
   * @returns The associated account identifier.
   */
  get accountId(): number {
    return this.#accountId;
  }

  /**
   * Gets the tutor's phone number.
   * @returns The tutor's phone number, or `null` if none is registered.
   */
  get phoneNumber(): string | null {
    return this.#phoneNumber;
  }

  /**
   * Updates the tutor's phone number.
   * @param value - New phone number, or `null` to remove the current value.
   */
  set phoneNumber(value: string | null) {
    this.#phoneNumber = value?.trim() || null;
  }
}
