import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root shell: the tutor and driver layouts provide the side menu and header of each role.
 */
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
