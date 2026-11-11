import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LocalProfilesApi } from './local-profiles-api';
import { Student, StudentStatus } from '../domain/model/student.entity';

describe('Local Spring Profiles REST adapter', () => {
  let api: LocalProfilesApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(LocalProfilesApi);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('loads persisted students and resolves school catalog names', () => {
    let result: Student[] = [];
    api.getStudents().subscribe(students => { result = students; });
    const studentsReq = http.expectOne('/api/v1/students');
    const schoolsReq = http.expectOne('/api/v1/schools');
    expect(studentsReq.request.method).toBe('GET');
    expect(schoolsReq.request.method).toBe('GET');
    studentsReq.flush([{
      id: 7, firstName: 'Estudiante', lastName: 'Ficticio',
      birthDate: '2018-04-12', schoolId: 3, status: 'ACTIVE',
    }]);
    schoolsReq.flush([{ id: 3, name: 'Colegio Demostración', address: 'Av. Demo 123', district: 'Lima' }]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(7);
    expect(result[0].schoolName).toBe('Colegio Demostración');
  });

  it('registers a student through Spring and reloads the assigned ID', () => {
    const student = new Student({
      id: 0, firstName: 'Estudiante', lastName: 'Ficticio',
      birthDate: '2018-04-12', schoolName: 'Colegio Demostración',
      status: StudentStatus.ACTIVE,
    });
    let created: Student | undefined;
    api.createStudent(student).subscribe(result => { created = result; });
    const schoolCatalog = http.expectOne('/api/v1/schools');
    schoolCatalog.flush([{ id: 3, name: 'Colegio Demostración', address: 'Av. Demo 123', district: 'Lima' }]);
    const post = http.expectOne('/api/v1/students');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({
      firstName: 'Estudiante', lastName: 'Ficticio', birthDate: '2018-04-12',
      schoolId: 3, relationshipType: 'OTHER',
    });
    post.flush({ id: 9 });
    const get = http.expectOne('/api/v1/students/9');
    get.flush({ id: 9, firstName: 'Estudiante', lastName: 'Ficticio',
      birthDate: '2018-04-12', schoolId: 3, status: 'ACTIVE' });
    expect(created?.id).toBe(9);
  });

  it('does not delete a minor directly through a generic CRUD endpoint', () => {
    let message = '';
    api.deleteStudent(1).subscribe({ error: e => { message = String(e.message); } });
    expect(message).toContain('supresión');
    http.expectNone('/api/v1/students/1');
  });
});
