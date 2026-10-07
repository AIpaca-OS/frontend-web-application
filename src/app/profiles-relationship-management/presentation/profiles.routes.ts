import { Routes } from '@angular/router';

const studentList = () => import('./views/student-list/student-list').then((m) => m.StudentList);

const studentForm = () => import('./views/student-form/student-form').then((m) => m.StudentForm);

const studentDetail = () =>
  import('./views/student-detail/student-detail').then((m) => m.StudentDetail);

const relationshipForm = () =>
  import('./views/relationship-form/relationship-form').then((m) => m.RelationshipForm);

/**
 * Route tree for student and relationship presentation views.
 */
export const profilesRoutes: Routes = [
  {
    path: '',
    loadComponent: studentList,
  },
  {
    path: 'new',
    loadComponent: studentForm,
  },
  {
    path: ':id',
    loadComponent: studentDetail,
  },
  {
    path: ':id/edit',
    loadComponent: studentForm,
  },
  {
    path: ':id/tutors/new',
    loadComponent: relationshipForm,
  },
];
