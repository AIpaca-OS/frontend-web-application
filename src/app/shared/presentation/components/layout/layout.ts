import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenu } from '../side-menu/side-menu';
import { HeaderContent } from '../header-content/header-content';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, SideMenu, HeaderContent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
