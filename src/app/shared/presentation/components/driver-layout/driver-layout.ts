import { Component, signal } from '@angular/core';
import { SideMenu } from '../side-menu/side-menu';
import { HeaderContent } from '../header-content/header-content';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-driver-layout',
  imports: [RouterOutlet, SideMenu, HeaderContent],
  templateUrl: './driver-layout.html',
  styleUrl: './driver-layout.css',
})
export class DriverLayout {
  sidebarOptions = signal([
    { link: '/driver/home', label: 'nav.home', icon: 'home' },
    { link: '/driver/students', label: 'nav.students', icon: 'group' },
    { link: '/driver/routes', label: 'nav.routes', icon: 'alt_route' },
    { link: '/driver/vehicles', label: 'nav.vehicles', icon: 'directions_bus' },
    { link: '/driver/notifications', label: 'nav.notifications', icon: 'notifications' },
    { link: '/driver/plans', label: 'nav.subscriptions', icon: 'payment' },
    { link: '/driver/configuration', label: 'nav.configuration', icon: 'settings' },
  ]);
}
