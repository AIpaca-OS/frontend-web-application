import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Student, StudentStatus } from '../domain/model/student.entity';
import { StudentsResponse, StudentResource } from './students-response';

/**
 * Maps Student entities to and from API resources.
 */
export class StudentAssembler implements BaseAssembler<Student, StudentResource, StudentsResponse> {
  /**
   * Converts a StudentsResponse into an array of Student entities.
   *
   * @param response - The API response containing students.
   * @returns An array of Student entities.
   */
  toEntitiesFromResponse = (response: StudentsResponse): Student[] =>
    response.students.map((resource) => this.toEntityFromResource(resource as StudentResource));

  /**
   * Converts a StudentResource into a Student entity.
   *
   * @param resource - The resource to convert.
   * @returns The converted Student entity.
   */
  toEntityFromResource = (resource: StudentResource): Student =>
    new Student({
      id: Number(resource.id),
      firstName: resource.firstName,
      lastName: resource.lastName,
      birthDate: resource.birthDate,
      schoolName: resource.schoolName,
      status: this.toStudentStatus(resource.status),
    });

  /**
   * Converts a Student entity into a StudentResource.
   *
   * @param entity - The entity to convert.
   * @returns The converted StudentResource.
   */
  toResourceFromEntity = (entity: Student): StudentResource =>
    ({
      id: String(entity.id),
      firstName: entity.firstName,
      lastName: entity.lastName,
      birthDate: entity.birthDate,
      schoolName: entity.schoolName,
      status: entity.status,
    }) as StudentResource;

  /**
   * Converts a string status received from the API
   * into a StudentStatus value.
   *
   * @param status - Status received from the API.
   * @returns The corresponding StudentStatus.
   * @throws Error if the status is not supported.
   */
  private toStudentStatus(status: string): StudentStatus {
    switch (status) {
      case StudentStatus.ACTIVE:
        return StudentStatus.ACTIVE;

      case StudentStatus.INACTIVE:
        return StudentStatus.INACTIVE;

      default:
        throw new Error(`Invalid student status: ${status}`);
    }
  }
}
