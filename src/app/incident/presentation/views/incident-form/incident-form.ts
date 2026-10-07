import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para [(ngModel)]
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-incident-form',
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatInputModule, MatFormFieldModule],
  templateUrl: './incident-form.html',
  styleUrl: './incident-form.css',
})
export class IncidentForm {}
