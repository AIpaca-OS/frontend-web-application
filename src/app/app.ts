import { Component, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Layout } from './shared/presentation/components/layout/layout';


@Component({
  selector: 'app-root',
  imports: [Layout],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Rumbo-frontend');

  private translate = inject(TranslateService);

  constructor() {
    this.translate.addLangs(['en', 'es']);
    this.translate.use('en');
  }
}
