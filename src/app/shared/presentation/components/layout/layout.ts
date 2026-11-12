import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenu } from '../side-menu/side-menu';
import { HeaderContent } from '../header-content/header-content';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet, SideMenu, HeaderContent,
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
