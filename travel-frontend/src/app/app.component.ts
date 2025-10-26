import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastNotificationComponent } from './shared/components/toast-notification.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastNotificationComponent, TranslateModule],
  template: `
    <app-toast-notification />
    <router-outlet />
  `
})
export class AppComponent implements OnInit {
  
  constructor(private languageService: LanguageService) {}
  
  ngOnInit(): void {
    // LanguageService sẽ tự động khởi tạo ngôn ngữ từ localStorage hoặc dùng default
  }
}