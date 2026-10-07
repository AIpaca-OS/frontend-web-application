import {Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'app-language-switcher',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  protected currentLang = 'en';
  protected languages: string[];
  private translate: TranslateService;

  constructor() {
    this.translate = inject(TranslateService);
    this.currentLang = this.translate.getCurrentLang() ?? 'en';
    this.languages = [...this.translate.getLangs()];
  }

  useLanguage = (language: string) => {
    this.translate.use(language);
    this.currentLang = language;
  };
}
