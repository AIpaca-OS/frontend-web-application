import { Component, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Layout } from './shared/presentation/components/layout/layout';

@Component({selector:'app-root',imports:[Layout],templateUrl:'./app.html',styleUrl:'./app.css'})
export class App {
  protected readonly title=signal('Rumbo-frontend');
  private readonly translate=inject(TranslateService);
  constructor(){this.translate.addLangs(['en','es-419']);this.translate.use('en');}
}
