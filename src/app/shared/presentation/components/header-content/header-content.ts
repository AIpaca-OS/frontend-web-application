import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

/**
 * Role label represents the selected layout only.
 * A verified name must come from IAM once login and JWT are integrated.
 */
@Component({
  selector: 'app-header-content',
  imports: [LanguageSwitcher, MatIconModule, CommonModule, RouterLink, TranslatePipe],
  templateUrl: './header-content.html',
  styleUrl: './header-content.css',
})
export class HeaderContent {
  readonly role = input<'driver' | 'tutor'>('driver');
}
