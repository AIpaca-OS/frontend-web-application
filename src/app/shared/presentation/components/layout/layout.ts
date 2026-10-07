import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterContent } from '../footer-content/footer-content';
import { SideMenu } from '../side-menu/side-menu';
import { HeaderContent } from '../header-content/header-content';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, FooterContent, SideMenu, HeaderContent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
