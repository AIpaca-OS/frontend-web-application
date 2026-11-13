import { BaseEntity } from '../../../shared/domain/model/base-entity';

export type EnrollmentStatus = 'PENDING' | 'ACCEPTED' | 'CANCELLED' | 'ENDED';
/** Transport enrolment is separate from the Student aggregate. */
export class ServiceEnrollment implements BaseEntity {
  constructor(public readonly id: number, public readonly studentId: number,
    public readonly driverProfileId: number, public readonly requestedByProfileId: number,
    public readonly status: EnrollmentStatus, public readonly requestedAt: string,
    public readonly acceptedAt: string | null, public readonly cancelledAt: string | null,
    public readonly endedAt: string | null) {}
}
