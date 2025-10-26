import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';

/**
 * Component chuyển đổi ngôn ngữ
 */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="language-switcher">
      <button 
        class="lang-btn"
        [class.active]="currentLang === 'vi'"
        (click)="switchLanguage('vi')"
        title="{{ 'LANGUAGE.VIETNAMESE' | translate }}">
        🇻🇳 VI
      </button>
      <button 
        class="lang-btn"
        [class.active]="currentLang === 'en'"
        (click)="switchLanguage('en')"
        title="{{ 'LANGUAGE.ENGLISH' | translate }}">
        🇬🇧 EN
      </button>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .lang-btn {
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .lang-btn:hover {
      background: #f5f5f5;
      border-color: #007bff;
      transform: translateY(-1px);
    }

    .lang-btn.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .lang-btn:active {
      transform: translateY(0);
    }
  `]
})
export class LanguageSwitcherComponent {
  currentLang: string;

  constructor(private languageService: LanguageService) {
    this.currentLang = this.languageService.getCurrentLanguage();
  }

  switchLanguage(lang: string): void {
    this.languageService.setLanguage(lang);
    this.currentLang = lang;
  }
}
