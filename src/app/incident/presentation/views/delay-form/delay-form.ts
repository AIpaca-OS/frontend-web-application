import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IncidentsStore } from '../../../application/incidents-store';
import { Delay } from '../../../domain/model/delay.entity';

@Component({selector:'app-delay-form',imports:[FormsModule,MatDialogModule,MatButtonModule,MatInputModule,MatFormFieldModule],templateUrl:'./delay-form.html',styleUrl:'./delay-form.css'})
export class DelayForm{
  private readonly store=inject(IncidentsStore);private readonly dialogRef=inject(MatDialogRef<DelayForm>);
  magnitude='5 minutos';cause='';
  submit(){if(!this.cause.trim())return;this.store.addDelay(new Delay({id:Date.now(),cause:this.cause.trim(),priority:'regular',magnitude:this.magnitude,studentIds:[],createdAt:new Date().toISOString()}));this.dialogRef.close(true);}
}
