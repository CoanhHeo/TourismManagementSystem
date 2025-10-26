import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Service quản lý đa ngôn ngữ cho ứng dụng
 */
@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly LANGUAGE_KEY = 'app_language';
  private readonly DEFAULT_LANGUAGE = 'vi';
  private readonly SUPPORTED_LANGUAGES = ['vi', 'en'];

  constructor(private translate: TranslateService) {
    this.initializeLanguage();
  }

  /**
   * Khởi tạo ngôn ngữ khi app start
   */
  private initializeLanguage(): void {
    // Set supported languages
    this.translate.addLangs(this.SUPPORTED_LANGUAGES);
    
    // Set default language
    this.translate.setDefaultLang(this.DEFAULT_LANGUAGE);
    
    // Get saved language or use default
    const savedLanguage = this.getSavedLanguage();
    this.setLanguage(savedLanguage);
  }

  /**
   * Lấy ngôn ngữ đã lưu từ localStorage
   */
  private getSavedLanguage(): string {
    const saved = localStorage.getItem(this.LANGUAGE_KEY);
    return saved && this.SUPPORTED_LANGUAGES.includes(saved) 
      ? saved 
      : this.DEFAULT_LANGUAGE;
  }

  /**
   * Đổi ngôn ngữ
   * @param lang Mã ngôn ngữ ('vi' | 'en')
   */
  setLanguage(lang: string): void {
    if (!this.SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`Language '${lang}' not supported. Using default.`);
      lang = this.DEFAULT_LANGUAGE;
    }
    
    this.translate.use(lang);
    localStorage.setItem(this.LANGUAGE_KEY, lang);
  }

  /**
   * Lấy ngôn ngữ hiện tại
   */
  getCurrentLanguage(): string {
    return this.translate.currentLang || this.DEFAULT_LANGUAGE;
  }

  /**
   * Lấy danh sách ngôn ngữ được hỗ trợ
   */
  getSupportedLanguages(): string[] {
    return this.SUPPORTED_LANGUAGES;
  }

  /**
   * Toggle giữa 2 ngôn ngữ
   */
  toggleLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    const newLang = currentLang === 'vi' ? 'en' : 'vi';
    this.setLanguage(newLang);
  }

  /**
   * Translate một key trực tiếp
   * @param key Translation key
   * @param params Optional parameters
   */
  instant(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }
}
