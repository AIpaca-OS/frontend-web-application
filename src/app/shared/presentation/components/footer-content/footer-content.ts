import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
@Component({selector:'app-footer-content',imports:[TranslatePipe,RouterLink],templateUrl:'./footer-content.html',styleUrl:'./footer-content.css'})
export class FooterContent{}
