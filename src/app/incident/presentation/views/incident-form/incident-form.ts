import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { IncidentsStore } from '../../../application/incidents-store';
import { Incident } from '../../../domain/model/incident.entity';

@Component({selector:'app-incident-form',imports:[FormsModule,MatDialogModule,MatButtonModule,MatInputModule,MatFormFieldModule,MatSelectModule],templateUrl:'./incident-form.html',styleUrl:'./incident-form.css'})
export class IncidentForm{
  private readonly store=inject(IncidentsStore); private readonly dialogRef=inject(MatDialogRef<IncidentForm>);
  title=''; message=''; priority='important';
  submit(){if(!this.title.trim()||!this.message.trim())return;this.store.addIncident(new Incident({id:Date.now(),title:this.title.trim(),message:this.message.trim(),priority:this.priority,studentIds:[],resolved:false,resolvedAt:'',createdAt:new Date().toISOString()}));this.dialogRef.close(true);}
}
