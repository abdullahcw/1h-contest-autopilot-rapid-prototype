import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable, of } from 'rxjs';

declare let readJSON: any;

export class TranslateCustomLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    if (lang == 'ar') {
      const ar = readJSON('assets/i18n/ar.json');
      return of(ar);
    }
    const en = readJSON('assets/i18n/en.json');
    return of(en);
  }
}

export const imports = [
    FormsModule,
    BrowserAnimationsModule,
    HttpClientTestingModule,
    ReactiveFormsModule,
    RouterTestingModule.withRoutes([]),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateCustomLoader
      }
    }),
    SharedModule,
];



