import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Student, StudentStatus } from '../domain/model/student.entity';
import { DriverStudentResource, StudentResource, StudentsResponse } from './students-response';

/**
 * Maps student entities to and from API resources.
 */
export class StudentAssembler implements BaseAssembler<Student, StudentResource, StudentsResponse> {
  /**
   * Converts a StudentsResponse to an array of Student entities.
   * @param response - The API response containing students.
   * @returns An array of Student entities.
   */
  toEntitiesFromResponse = (response: StudentsResponse): Student[] =>
    response.students.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a StudentResource to a Student entity.
   * @param resource - The resource to convert.
   * @returns The converted Student entity.
   */
  toEntityFromResource = (resource: StudentResource): Student => new Student({
    id: resource.id,
    firstName: resource.firstName,
    lastName: resource.lastName,
    birthDate: resource.birthDate,
    status: resource.status === 'INACTIVE' ? StudentStatus.INACTIVE : StudentStatus.ACTIVE,
  });

  /**
   * Converts the driver-side student summary to a Student entity (the summary has no birth date).
   * @param resource - The summary resource to convert.
   * @returns The converted Student entity.
   */
  toEntityFromDriverStudentResource = (resource: DriverStudentResource): Student => new Student({
    id: resource.id,
    firstName: resource.firstName,
    lastName: resource.lastName,
    birthDate: '',
    status: resource.status === 'INACTIVE' ? StudentStatus.INACTIVE : StudentStatus.ACTIVE,
  });

  /**
   * Converts a Student entity to a StudentResource.
   * @param entity - The entity to convert.
   * @returns The converted StudentResource.
   */
  toResourceFromEntity = (entity: Student): StudentResource => ({
    id: entity.id,
    firstName: entity.firstName,
    lastName: entity.lastName,
    birthDate: entity.birthDate,
    status: entity.status,
    anonymizedAt: null,
  });
}
