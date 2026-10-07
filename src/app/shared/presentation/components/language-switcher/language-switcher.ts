import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';
@Component({selector:'app-language-switcher',imports:[MatButtonModule,MatIconModule,MatMenuModule],templateUrl:'./language-switcher.html',styleUrl:'./language-switcher.css'})
export class LanguageSwitcher{protected currentLang='en';protected readonly languages=['en','es-419'];private readonly translate=inject(TranslateService);constructor(){this.currentLang=this.translate.getCurrentLang()||'en';}useLanguage(language:string){this.translate.use(language);this.currentLang=language;}}
