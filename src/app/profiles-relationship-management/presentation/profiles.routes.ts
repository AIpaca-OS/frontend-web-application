import { Routes } from '@angular/router';
const studentList=()=>import('./views/student-list/student-list').then(m=>m.StudentList);
const studentForm=()=>import('./views/student-form/student-form').then(m=>m.StudentForm);
export const profilesRoutes:Routes=[{path:'',loadComponent:studentList},{path:'new',loadComponent:studentForm},{path:':id/edit',loadComponent:studentForm}];
