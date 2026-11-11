import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, shareReplay, switchMap, throwError } from 'rxjs';
import { Student, StudentStatus } from '../domain/model/student.entity';
import { Driver } from '../domain/model/driver.entity';
import { Tutor } from '../domain/model/tutor.entity';
import { TutorStudentRelationship, RelationshipType, AuthorizationStatus } from '../domain/model/tutor-student-relationship.entity';
import { DataDeletionRequest, DeletionRequestStatus } from '../domain/model/data-deletion-request.entity';

interface StudentDto { id: number; firstName: string; lastName: string; birthDate: string; schoolId: number|null; status: 'ACTIVE'|'INACTIVE'; }
interface ProfileDto { id: number; accountId: number; profileType: 'DRIVER'|'TUTOR'; firstName: string; lastName: string; phoneNumber: string|null; }
interface SchoolDto { id: number; name: string; address: string; district: string; }
interface RelationshipDto { id: number; tutorProfileId: number; relationshipType: RelationshipType; authorizationStatus: AuthorizationStatus; authorizedAt: string; revokedAt: string|null; }
interface DeletionDto { id: number; studentId: number; requestedByProfileId: number; status: DeletionRequestStatus; requestedAt: string; resolvedAt: string|null; }
interface CreatedIdDto { id: number; }

/**
 * Bounded-context HTTP adapter for the localhost-only Sprint 3 demonstration.
 * Neither its demo role nor its data may be used for production authorization.
 */
@Injectable({ providedIn: 'root' })
export class LocalProfilesApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1';
  private readonly schools = this.http.get<SchoolDto[]>(this.base + '/schools')
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  private student(d: StudentDto, schools: SchoolDto[]): Student {
    return new Student({
      id: d.id, firstName: d.firstName, lastName: d.lastName,
      birthDate: d.birthDate, status: d.status === 'ACTIVE' ? StudentStatus.ACTIVE : StudentStatus.INACTIVE,
      schoolName: schools.find(s => s.id === d.schoolId)?.name ?? 'Sin colegio',
    });
  }
  private profile(d: ProfileDto): Tutor | Driver {
    const data = {
      id: d.id, accountId: d.accountId, firstName: d.firstName,
      lastName: d.lastName, phoneNumber: d.phoneNumber,
    };
    return d.profileType === 'DRIVER' ? new Driver(data) : new Tutor(data);
  }
  private relationship(d: RelationshipDto, studentId: number): TutorStudentRelationship {
    return new TutorStudentRelationship({
      id: d.id, studentId, tutorId: d.tutorProfileId,
      relationshipType: d.relationshipType,
      authorizationStatus: d.authorizationStatus,
      authorizedAt: d.authorizedAt, revokedAt: d.revokedAt,
    });
  }
  private deletion(d: DeletionDto): DataDeletionRequest {
    return new DataDeletionRequest({
      id: d.id, studentId: d.studentId,
      requestedByTutorId: d.requestedByProfileId,
      status: d.status, requestedAt: d.requestedAt,
      resolvedAt: d.resolvedAt,
    });
  }
  private schoolId(schoolName: string, schools: SchoolDto[]): number|null {
    const id = schools.find(s => s.name.trim().toLocaleLowerCase() === schoolName.trim().toLocaleLowerCase())?.id;
    if (id === undefined && schoolName !== 'Sin colegio') {
      throw new Error('Selecciona un colegio existente del catálogo de Rumbo');
    }
    return id ?? null;
  }
  private studentBody(s: Student, schools: SchoolDto[]): object {
    if (s.status !== StudentStatus.ACTIVE) {
      throw new Error('La desactivación de estudiantes todavía no está disponible en esta API');
    }
    return {
      firstName: s.firstName, lastName: s.lastName,
      birthDate: s.birthDate, schoolId: this.schoolId(s.schoolName, schools),
    };
  }

  getStudents(): Observable<Student[]> {
    return forkJoin([this.http.get<StudentDto[]>(this.base + '/students'), this.schools])
      .pipe(map(([students,schools]) => students.map(s=>this.student(s,schools))));
  }
  getStudent(id: number): Observable<Student> {
    return forkJoin([this.http.get<StudentDto>(this.base + '/students/' + id),this.schools])
      .pipe(map(([s,schools])=>this.student(s,schools)));
  }
  createStudent(s: Student): Observable<Student> {
    return this.schools.pipe(switchMap(schools => this.http.post<CreatedIdDto>(
      this.base + '/students',
      { ...this.studentBody(s,schools), relationshipType: 'OTHER' },
    )), switchMap(created => this.getStudent(created.id)));
  }
  updateStudent(s: Student): Observable<Student> {
    return this.schools.pipe(switchMap(schools => this.http.put<CreatedIdDto>(
      this.base + '/students/' + s.id, this.studentBody(s,schools),
    )), switchMap(() => this.getStudent(s.id)));
  }
  deleteStudent(_id: number): Observable<void> {
    return throwError(() => new Error('La eliminación requiere una solicitud de supresión de datos; no se elimina directamente al estudiante'));
  }
  getProfiles(): Observable<(Tutor|Driver)[]> {
    return this.http.get<ProfileDto>(this.base + '/profiles/me')
      .pipe(map(profile => [this.profile(profile)]));
  }
  getProfile(id: number): Observable<Tutor|Driver> {
    return this.http.get<ProfileDto>(this.base + '/profiles/' + id).pipe(map(d=>this.profile(d)));
  }
  createProfile(p: Tutor|Driver): Observable<Tutor|Driver> {
    return this.http.post<CreatedIdDto>(this.base + '/profiles',{
      profileType: p instanceof Driver ? 'DRIVER':'TUTOR',
      firstName:p.firstName,lastName:p.lastName,phoneNumber:p.phoneNumber ?? '900000000',
    }).pipe(switchMap(created=>this.getProfile(created.id)));
  }
  updateProfile(_p: Tutor|Driver): Observable<Tutor|Driver> {
    return throwError(()=>new Error('El backend permite actualizar el teléfono mediante /profiles/me/contact, no reemplazar el perfil completo'));
  }
  deleteProfile(_id:number): Observable<void> {
    return throwError(()=>new Error('Eliminar directamente un perfil no está habilitado'));
  }
  getRelationships(): Observable<TutorStudentRelationship[]> {
    return this.http.get<StudentDto[]>(this.base + '/students').pipe(
      switchMap(students => students.length ? forkJoin(students.map(s =>
        this.http.get<RelationshipDto[]>(this.base+'/students/'+s.id+'/tutors')
          .pipe(map(rows => rows.map(r => this.relationship(r,s.id)))))
      )).pipe(map(rows => rows.flat())) : of([])),
    );
  }
  getRelationship(id:number): Observable<TutorStudentRelationship> {
    return this.getRelationships().pipe(map(rows => {
      const item=rows.find(r=>r.id===id);
      if(!item) throw new Error('Relación no encontrada');
      return item;
    }));
  }
  createRelationship(r:TutorStudentRelationship): Observable<TutorStudentRelationship> {
    return this.http.post<CreatedIdDto>(this.base+'/students/'+r.studentId+'/tutors',{
      tutorProfileId:r.tutorId, relationshipType:r.relationshipType,
    }).pipe(switchMap(()=>this.getRelationships()), map(rows=>{
      const item=rows.find(v=>v.studentId===r.studentId&&v.tutorId===r.tutorId&&v.authorizationStatus===AuthorizationStatus.AUTHORIZED);
      if(!item)throw new Error('No se pudo consultar la relación autorizada');
      return item;
    }));
  }
  updateRelationship(_r:TutorStudentRelationship): Observable<TutorStudentRelationship> {
    return throwError(()=>new Error('Solo puede autorizarse o revocarse una relación, no editarse'));
  }
  deleteRelationship(id:number): Observable<void> {
    return this.getRelationship(id).pipe(switchMap(r=>
      this.http.post<void>(this.base+'/students/'+r.studentId+'/tutors/'+r.tutorId+'/revoke',{})),
    );
  }
  getDeletionRequests(): Observable<DataDeletionRequest[]> {
    return this.http.get<DeletionDto[]>(this.base+'/data-deletion-requests/mine')
      .pipe(map(rows=>rows.map(d=>this.deletion(d))));
  }
  getDeletionRequest(id:number): Observable<DataDeletionRequest> {
    return this.http.get<DeletionDto>(this.base+'/data-deletion-requests/'+id)
      .pipe(map(d=>this.deletion(d)));
  }
  createDeletionRequest(request:DataDeletionRequest): Observable<DataDeletionRequest> {
    return this.http.post<CreatedIdDto>(this.base+'/data-deletion-requests',{
      studentId:request.studentId,
    }).pipe(switchMap(created=>this.getDeletionRequest(created.id)));
  }
  updateDeletionRequest(_r:DataDeletionRequest): Observable<DataDeletionRequest> {
    return throwError(()=>new Error('La resolución de supresión se realiza exclusivamente mediante el procedimiento autorizado'));
  }
  deleteDeletionRequest(_id:number): Observable<void> {
    return throwError(()=>new Error('Las solicitudes de supresión deben conservarse como evidencia del trámite'));
  }
}
