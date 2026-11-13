import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, TranslatePipe],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
/**
 * Switches the active locale used by the translation service.
 */
export class LanguageSwitcher {
  /**
   * List of available language codes.
   */
  protected readonly languages = ['en', 'es-419'];

  private readonly translate = inject(TranslateService);

  /**
   * The currently selected language code (shared by every switcher instance).
   */
  protected get currentLang(): string {
    return this.translate.getCurrentLang() || 'en';
  }

  /**
   * Changes the application's current language.
   * @param language - The language code to switch to.
   */
  useLanguage(language: string): void {
    this.translate.use(language);
  }
}
