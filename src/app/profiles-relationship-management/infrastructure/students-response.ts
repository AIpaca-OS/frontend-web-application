import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Resource returned by GET/POST/PUT /students (StudentResponse in Swagger).
 */
export interface StudentResource extends BaseResource {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  anonymizedAt: string | null;
}

/**
 * Summary returned by GET /service-enrollments/drivers/{driverProfileId}/students (DriverStudentResponse in Swagger).
 */
export interface DriverStudentResource extends BaseResource {
  id: number;
  firstName: string;
  lastName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

/**
 * Response envelope for student collection queries.
 *
 * @remarks
 * Spring Boot returns plain arrays; the envelope is kept for the BaseAssembler contract.
 */
export interface StudentsResponse extends BaseResponse {
  students: StudentResource[];
}
