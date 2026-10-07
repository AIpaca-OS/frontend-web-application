import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { FooterContent } from '../footer-content/footer-content';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-side-menu',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    RouterLinkActive,
    TranslatePipe,
    MatIcon,
  ],
  templateUrl: './side-menu.html',
  styleUrl: './side-menu.css',
})
export class SideMenu {}
