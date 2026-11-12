import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { QuickActions } from '../../../../incident/presentation/components/quick-actions/quick-actions';
@Component({selector:'app-home',imports:[TranslatePipe,QuickActions],templateUrl:'./home.html',styleUrl:'./home.css'})
export class Home{}
