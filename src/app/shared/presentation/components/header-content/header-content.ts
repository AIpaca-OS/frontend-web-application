import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LanguageSwitcher } from '../language-switcher/language-switcher'

@Component({
  selector: 'app-header-content',
  imports: [LanguageSwitcher, MatIconModule, CommonModule],
  templateUrl: './header-content.html',
  styleUrl: './header-content.css',
})
export class HeaderContent {}
