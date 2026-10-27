import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { ProfilesRelationshipApi } from '../../profiles-relationship-management/infrastructure/profiles-relationship-management-api';
import { StudentStatus } from '../../profiles-relationship-management/domain/model/student.entity';
import { AuthorizationStatus } from '../../profiles-relationship-management/domain/model/tutor-student-relationship.entity';

export interface RouteStudentOption {
  id: string;
  fullName: string;
}

/**
 * Adaptador provisional para el catálogo del prototipo.
 * No sustituye la validación de acceso del conductor en el backend.
 */
@Injectable({ providedIn: 'root' })
export class RouteStudentCatalog {
  private readonly profilesApi = inject(ProfilesRelationshipApi);

  getCandidates(): Observable<RouteStudentOption[]> {
    return forkJoin({
      students: this.profilesApi.getStudents(),
      relationships: this.profilesApi.getTutorStudentRelationships(),
    }).pipe(
      map(({ students, relationships }) => {
        const authorizedIds = new Set(
          relationships
            .filter(relationship => relationship.authorizationStatus === AuthorizationStatus.AUTHORIZED
              && relationship.revokedAt === null)
            .map(relationship => String(relationship.studentId)),
        );
        return students
          .filter(student => student.status === StudentStatus.ACTIVE
            && authorizedIds.has(String(student.id)))
          .map(student => ({
            id: String(student.id),
            fullName: `${student.firstName} ${student.lastName}`.trim(),
          }))
          .sort((a, b) => a.fullName.localeCompare(b.fullName, 'es'));
      }),
    );
  }
}
