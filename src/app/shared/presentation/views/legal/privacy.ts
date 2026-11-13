import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
@Component({selector:'app-privacy-page',imports:[TranslatePipe],template:`<section class="legal-page"><h1>{{ 'legal.privacy.title' | translate }}</h1><p>{{ 'legal.privacy.paragraph1' | translate }}</p><p>{{ 'legal.privacy.paragraph2' | translate }}</p></section>`,styles:[`.legal-page{box-sizing:border-box;width:100%;max-width:var(--rumbo-page-max-width);margin:0 auto;padding:var(--rumbo-page-padding);}.legal-page p{line-height:1.6}`]})
export class PrivacyPage{}
