import { Person } from './person';

/**
 * Represents a driver within the
 * Profiles & Relationship Management bounded context.
 *
 * @remarks
 * A driver extends the common personal information provided by {@link Person}
 * and maintains a reference to the account associated with the driver,
 * together with an optional phone number.
 */
export class Driver extends Person {
  /**
   * Identifier of the account associated with the driver.
   *
   * @remarks
   * This value references the driver's account managed by the
   * Identity & Access Management bounded context.
   */
  readonly #accountId: number;

  /**
   * Driver's phone number.
   *
   * @remarks
   * The value can be `null` when no phone number has been provided.
   */
  #phoneNumber: string | null;

  /**
   * Creates a new {@link Driver} instance.
   *
   * @param props - Properties required to initialize the driver.
   * @param props.id - Unique identifier of the driver.
   * @param props.firstName - Driver's first name.
   * @param props.lastName - Driver's last name.
   * @param props.accountId - Identifier of the driver's associated account.
   * @param props.phoneNumber - Driver's phone number, or `null` if none is available.
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
   * Gets the identifier of the account associated with the driver.
   * @returns The associated account identifier.
   */
  get accountId(): number {
    return this.#accountId;
  }

  /**
   * Gets the driver's phone number.
   * @returns The driver's phone number, or `null` if none is registered.
   */
  get phoneNumber(): string | null {
    return this.#phoneNumber;
  }

  /**
   * Updates the driver's phone number.
   * @param value - New phone number, or `null` to remove the current value.
   */
  set phoneNumber(value: string | null) {
    this.#phoneNumber = value?.trim() || null;
  }
}
