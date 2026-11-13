import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
@Component({selector:'app-terms-page',imports:[TranslatePipe],template:`<section class="legal-page"><h1>{{ 'legal.terms.title' | translate }}</h1><p>{{ 'legal.terms.paragraph1' | translate }}</p><p>{{ 'legal.terms.paragraph2' | translate }}</p></section>`,styles:[`.legal-page{box-sizing:border-box;width:100%;max-width:var(--rumbo-page-max-width);margin:0 auto;padding:var(--rumbo-page-padding);}.legal-page p{line-height:1.6}`]})
export class TermsPage{}
