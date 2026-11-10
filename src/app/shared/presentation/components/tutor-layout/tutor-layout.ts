import { Component, signal } from '@angular/core';
import { SideMenu } from '../side-menu/side-menu';
import { HeaderContent } from '../header-content/header-content';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tutor-layout',
  imports: [RouterOutlet, SideMenu, HeaderContent],
  templateUrl: './tutor-layout.html',
  styleUrl: './tutor-layout.css',
})
export class TutorLayout {
  sidebarOptions = signal([
    { link: '/tutor/home', label: 'nav.home', icon: 'home' },
    { link: '/tutor/current-trip', label: 'nav.trip', icon: 'route' },
    
    { link: '/tutor/notifications', label: 'nav.notifications', icon: 'notifications' },
    { link: '/tutor/students', label: 'nav.students', icon: 'person' },
    
    { link: '/tutor/configuration', label: 'nav.configuration', icon: 'settings' },
  ]);
}
