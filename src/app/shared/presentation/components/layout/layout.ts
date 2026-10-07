import {Component, signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageSwitcher} from '../language-switcher/language-switcher';
import {FooterContent} from '../footer-content/footer-content';
import { MatIcon } from '@angular/material/icon';
import { SideMenu } from '../side-menu/side-menu';
import { HeaderContent } from '../header-content/header-content'

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    RouterLinkActive,
    TranslatePipe,
    LanguageSwitcher,
    FooterContent,
    MatIcon,
    SideMenu,
    HeaderContent
    // AuthenticationSection
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  /**
   * Array of navigation options for the application's menu.
   */
  options = signal([
    { link: '/home', label: 'option.home' },
    { link: '/about', label: 'option.about' },
    { link: '/learning/categories', label: 'option.categories' },
    { link: '/learning/courses', label: 'option.courses' },
  ]);
}
