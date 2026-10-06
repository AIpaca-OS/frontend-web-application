import { Person } from './person';

/**
 * Represents a student entity within the
 * Profiles & Relationship Management bounded context.
 *
 * A student contains personal information inherited from {@link Person},
 * together with student-specific information such as the birthdate
 * and current status.
 */
export class Student extends Person {
  /**
   * The birthdate of the student.
   *
   * @remarks
   * The date is expected to be represented as a string
   * Using the `YYYY-MM-DD` format.
   */
  #birthDate: string;

  /**
   * The student's school name.
   */
  #schoolName: string;

  /**
   * The current status of the student.
   */
  #status: StudentStatus;

  /**
   * Creates a new {@link Student} instance.
   *
   * @param props - Initialization values
   * @param props.id - Unique identifier of the student.
   * @param props.firstName - Student's first name.
   * @param props.lastName - Student's last name.
   * @param props.birthDate - Student's date of birth in `YYYY-MM-DD` format.
   * @param props.status - Current student status.
   * If omitted, it defaults to {@link StudentStatus.ACTIVE}.
   */
  constructor(props: {
    id: number;
    firstName: string;
    lastName: string;
    birthDate: string;
    schoolName: string;
    status?: StudentStatus;
  }) {
    super({
      id: props.id,
      firstName: props.firstName,
      lastName: props.lastName,
    });

    this.#birthDate = props.birthDate;
    this.#schoolName = props.schoolName;
    this.#status = props.status ?? StudentStatus.ACTIVE;
  }

  /**
   * Gets the student's date of birth.
   * @returns The birthdate in `YYYY-MM-DD` format.
   */
  get birthDate(): string {
    return this.#birthDate;
  }

  /**
   * Updates the student's school name.
   * @param value - New school's name.
   */
  set schoolName(value: string) {
    this.#schoolName = value.trim();
  }

  /**
   * Gets the student's school name.
   * @returns The school's name.
   */
  get schoolName(): string {
    return this.#schoolName;
  }

  /**
   * Updates the student's date of birth.
   * @param value - New birthdate in `YYYY-MM-DD` format.
   */
  set birthDate(value: string) {
    this.#birthDate = value.trim();
  }

  /**
   * Gets the current status of the student.
   * @returns The current {@link StudentStatus}.
   */
  get status(): StudentStatus {
    return this.#status;
  }

  /**
   * Updates the current status of the student.
   * @param value - New status to assign to the student.
   */
  set status(value: StudentStatus) {
    this.#status = value;
  }
}

/**
 * Represents the possible statuses of a student
 * within the Profiles & Relationship Management bounded context.
 */
export enum StudentStatus {

  /**
   * Indicates that the student is currently active
   * and can participate in the service.
   */
  ACTIVE = 'ACTIVE',

  /**
   * Indicates that the student is currently inactive.
   */
  INACTIVE = 'INACTIVE',
}
