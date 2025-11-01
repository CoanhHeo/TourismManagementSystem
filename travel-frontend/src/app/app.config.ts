import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

/**
 * Custom TranslateLoader - tải file JSON translation
 * Kiểm tra môi trường và sử dụng đường dẫn phù hợp
 */
export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    // Sử dụng đường dẫn tương đối để hoạt động trên cả web và mobile
    return this.http.get(`i18n/${lang}.json`);
  }
}

/**
 * Factory function cho TranslateLoader
 */
export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new CustomTranslateLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),       // HttpClient cho gọi API
    provideAnimations(),
    // Cấu hình ngx-translate cho đa ngôn ngữ
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'vi',    // Ngôn ngữ mặc định là Tiếng Việt
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ],
};