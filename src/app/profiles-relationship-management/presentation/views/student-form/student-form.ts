import { Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProfilesRelationshipStore } from '../../../application/profiles-relationship-management-store';
import { Student, StudentStatus } from '../../../domain/model/student.entity';
@Component({selector:'app-student-form',imports:[ReactiveFormsModule,MatButtonModule,MatFormFieldModule,MatInputModule,MatSelectModule],template:`<section class="page"><h1>{{isEdit?'Editar estudiante':'Nuevo estudiante'}}</h1><form [formGroup]="form" (ngSubmit)="submit()" class="form"><mat-form-field appearance="outline"><mat-label>Nombres</mat-label><input matInput formControlName="firstName"></mat-form-field><mat-form-field appearance="outline"><mat-label>Apellidos</mat-label><input matInput formControlName="lastName"></mat-form-field><mat-form-field appearance="outline"><mat-label>Fecha de nacimiento</mat-label><input matInput type="date" formControlName="birthDate"></mat-form-field><mat-form-field appearance="outline"><mat-label>Colegio</mat-label><input matInput formControlName="schoolName"></mat-form-field><mat-form-field appearance="outline"><mat-label>Estado</mat-label><mat-select formControlName="status"><mat-option value="ACTIVE">ACTIVE</mat-option><mat-option value="INACTIVE">INACTIVE</mat-option></mat-select></mat-form-field><div class="actions"><button mat-button type="button" (click)="cancel()">Cancelar</button><button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Guardar</button></div></form></section>`,styles:[`.page{max-width:720px;padding:24px}.form{display:grid;gap:12px}.actions{display:flex;justify-content:flex-end;gap:8px}`]})
export class StudentForm{
  readonly store=inject(ProfilesRelationshipStore);private readonly fb=inject(FormBuilder);private readonly route=inject(ActivatedRoute);private readonly router=inject(Router);
  studentId:number|null=null;isEdit=false;
  readonly form=this.fb.nonNullable.group({firstName:['',Validators.required],lastName:['',Validators.required],birthDate:['',Validators.required],schoolName:['',Validators.required],status:['ACTIVE',Validators.required]});
  constructor(){const id=this.route.snapshot.paramMap.get('id');this.studentId=id?Number(id):null;this.isEdit=this.studentId!==null;effect(()=>{if(this.studentId===null)return;const s=this.store.students().find(x=>x.id===this.studentId);if(s)this.form.patchValue({firstName:s.firstName,lastName:s.lastName,birthDate:s.birthDate,schoolName:s.schoolName,status:s.status});});}
  submit(){if(this.form.invalid)return;const v=this.form.getRawValue();const s=new Student({id:this.studentId??Date.now(),firstName:v.firstName,lastName:v.lastName,birthDate:v.birthDate,schoolName:v.schoolName,status:v.status as StudentStatus});if(this.isEdit)this.store.updateStudent(s);else this.store.addStudent(s);this.router.navigate(['/students']).then();}
  cancel(){this.router.navigate(['/students']).then();}
}
