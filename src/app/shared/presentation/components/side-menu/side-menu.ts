import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';

export interface SidebarOption {
  link: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-side-menu',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, MatIcon],
  templateUrl: './side-menu.html',
  styleUrl: './side-menu.css',
})
export class SideMenu {
  options = input<SidebarOption[]>([]);
}
