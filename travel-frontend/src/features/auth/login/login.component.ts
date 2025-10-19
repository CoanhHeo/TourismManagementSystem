import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../app/core/services/api/auth.service';
import { ToastService } from '../../../app/shared/services/toast.service';
import { LoginRequest } from '../../../app/shared/models/interfaces';
import { ValidationUtils } from '../../../app/shared/utils/utils';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <!-- Background Elements -->
      <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>

      <!-- Main Container -->
      <div class="auth-container">
        <!-- Left Side - Welcome Section -->
        <div class="welcome-section">
          <div class="welcome-content">
            <div class="logo-section">
              <div class="logo">
                <i class="logo-icon">🌍</i>
                <span class="logo-text">TravelViet</span>
              </div>
            </div>
            
            <h1 class="welcome-title">Chào mừng trở lại!</h1>
            <p class="welcome-subtitle">
              Đăng nhập để khám phá những chuyến du lịch tuyệt vời và 
              đặt tour yêu thích của bạn
            </p>
            
            <div class="features-list">
              <div class="feature-item">
                <i class="feature-icon">✈️</i>
                <span>Hàng ngàn tour du lịch</span>
              </div>
              <div class="feature-item">
                <i class="feature-icon">💰</i>
                <span>Giá cả cạnh tranh</span>
              </div>
              <div class="feature-item">
                <i class="feature-icon">🎯</i>
                <span>Dịch vụ chuyên nghiệp</span>
              </div>
              <div class="feature-item">
                <i class="feature-icon">🔒</i>
                <span>Bảo mật an toàn</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="form-section">
          <div class="form-container">
            <div class="form-header">
              <h2 class="form-title">Đăng nhập</h2>
              <p class="form-subtitle">Nhập thông tin để truy cập tài khoản</p>
            </div>

            <form (ngSubmit)="onSubmit()" #f="ngForm" class="auth-form">
              <div class="form-group">
                <label class="form-label">
                  <i class="input-icon">📧</i>
                  Email
                </label>
                <div class="input-wrapper">
                  <input 
                    type="email" 
                    [(ngModel)]="form.email" 
                    name="email" 
                    required 
                    placeholder="Nhập địa chỉ email"
                    class="form-input"
                    [class.error]="emailError"
                    (blur)="validateEmail()"
                  />
                </div>
                <div *ngIf="emailError" class="field-error">{{ emailError }}</div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="input-icon">🔐</i>
                  Mật khẩu
                </label>
                <div class="input-wrapper">
                  <input 
                    [type]="showPassword ? 'text' : 'password'" 
                    [(ngModel)]="form.password" 
                    name="password" 
                    required 
                    placeholder="Nhập mật khẩu"
                    class="form-input"
                    [class.error]="passwordError"
                  />
                  <button 
                    type="button" 
                    class="password-toggle"
                    (click)="togglePassword()"
                  >
                    <i>{{ showPassword ? '👁️' : '👁️‍🗨️' }}</i>
                  </button>
                </div>
                <div *ngIf="passwordError" class="field-error">{{ passwordError }}</div>
              </div>

              <div class="form-options">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe">
                  <span class="checkmark"></span>
                  Ghi nhớ đăng nhập
                </label>
                
                <a href="#" class="forgot-link">Quên mật khẩu?</a>
              </div>

              <button 
                type="submit" 
                [disabled]="!f.valid || loading" 
                class="btn-primary"
                [class.loading]="loading"
              >
                <span *ngIf="!loading" class="btn-content">
                  <i class="btn-icon">🚀</i>
                  Đăng nhập
                </span>
                <span *ngIf="loading" class="btn-loading">
                  <div class="spinner"></div>
                  Đang xử lý...
                </span>
              </button>
            </form>

            <!-- Error/Success Messages -->
            <div *ngIf="error" class="alert alert-error">
              <i class="alert-icon">⚠️</i>
              <span>{{ error }}</span>
            </div>

            <div *ngIf="success" class="alert alert-success">
              <i class="alert-icon">✅</i>
              <span>{{ success }}</span>
            </div>

            <!-- Social Login -->
            <div class="social-section">
              <div class="divider">
                <span>Hoặc đăng nhập bằng</span>
              </div>
              
              <div class="social-buttons">
                <button class="social-btn google-btn" type="button">
                  <i class="social-icon">📱</i>
                  Google
                </button>
                <button class="social-btn facebook-btn" type="button">
                  <i class="social-icon">📘</i>
                  Facebook
                </button>
              </div>
            </div>

            <!-- Register Link -->
            <div class="auth-link">
              <p>
                Chưa có tài khoản? 
                <a routerLink="/register" class="register-link">
                  Đăng ký ngay
                  <i class="link-arrow">→</i>
                </a>
              </p>
            </div>

            <!-- Navigation Links -->
            <div class="nav-links">
              <a routerLink="/tours" class="nav-link">
                <i class="nav-icon">🌍</i>
                Xem danh sách tour
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      position: relative;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow: hidden;
    }

    .bg-shapes {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      z-index: 1;
    }

    .shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 6s ease-in-out infinite;
    }

    .shape-1 {
      width: 80px;
      height: 80px;
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }

    .shape-2 {
      width: 120px;
      height: 120px;
      top: 60%;
      right: 15%;
      animation-delay: 2s;
    }

    .shape-3 {
      width: 100px;
      height: 100px;
      bottom: 20%;
      left: 20%;
      animation-delay: 4s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    .auth-container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      display: flex;
      max-width: 1000px;
      width: 100%;
      min-height: 600px;
      position: relative;
      z-index: 2;
    }

    .welcome-section {
      flex: 1;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 60px 40px;
      display: flex;
      align-items: center;
      position: relative;
    }

    .welcome-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="1" fill="white" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
    }

    .welcome-content {
      position: relative;
      z-index: 1;
    }

    .logo-section {
      margin-bottom: 40px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .logo-icon {
      font-size: 2.5rem;
      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
    }

    .logo-text {
      font-size: 1.8rem;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .welcome-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 20px;
      line-height: 1.2;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .welcome-subtitle {
      font-size: 1.1rem;
      line-height: 1.6;
      opacity: 0.9;
      margin-bottom: 40px;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .feature-icon {
      font-size: 1.5rem;
    }

    .form-section {
      flex: 1;
      padding: 60px 40px;
      display: flex;
      align-items: center;
    }

    .form-container {
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
    }

    .form-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .form-title {
      font-size: 2rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 10px;
    }

    .form-subtitle {
      color: #666;
      font-size: 1rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .input-icon {
      font-size: 16px;
    }

    .input-wrapper {
      position: relative;
    }

    .form-input {
      width: 100%;
      padding: 15px 20px;
      border: 2px solid #e1e5e9;
      border-radius: 12px;
      font-size: 16px;
      transition: all 0.3s ease;
      background: #f8f9fa;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    .form-input.error {
      border-color: #dc3545;
      background: #fff5f5;
    }

    .password-toggle {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      color: #666;
      padding: 5px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .password-toggle:hover {
      background: rgba(102, 126, 234, 0.1);
    }

    .field-error {
      color: #dc3545;
      font-size: 12px;
      margin-top: 4px;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 10px 0;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
      color: #666;
    }

    .checkbox-label input[type="checkbox"] {
      display: none;
    }

    .checkmark {
      width: 18px;
      height: 18px;
      border: 2px solid #e1e5e9;
      border-radius: 4px;
      position: relative;
      transition: all 0.3s ease;
    }

    .checkbox-label input:checked + .checkmark {
      background: #667eea;
      border-color: #667eea;
    }

    .checkbox-label input:checked + .checkmark::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 12px;
      font-weight: bold;
    }

    .forgot-link {
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .forgot-link:hover {
      color: #5a6fd8;
      text-decoration: underline;
    }

    .btn-primary {
      padding: 16px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-icon {
      font-size: 18px;
    }

    .btn-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .alert {
      padding: 15px 20px;
      border-radius: 12px;
      margin: 20px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
    }

    .alert-error {
      background: #fff5f5;
      color: #dc3545;
      border: 1px solid #f5c6cb;
    }

    .alert-success {
      background: #f0fff4;
      color: #28a745;
      border: 1px solid #c3e6cb;
    }

    .alert-icon {
      font-size: 18px;
    }

    .social-section {
      margin: 30px 0;
    }

    .divider {
      text-align: center;
      position: relative;
      margin: 25px 0;
      color: #666;
      font-size: 14px;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e1e5e9;
      z-index: 1;
    }

    .divider span {
      background: white;
      padding: 0 20px;
      position: relative;
      z-index: 2;
    }

    .social-buttons {
      display: flex;
      gap: 15px;
    }

    .social-btn {
      flex: 1;
      padding: 12px;
      border: 2px solid #e1e5e9;
      background: white;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .social-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    .google-btn:hover {
      border-color: #db4437;
      color: #db4437;
    }

    .facebook-btn:hover {
      border-color: #4267b2;
      color: #4267b2;
    }

    .social-icon {
      font-size: 18px;
    }

    .auth-link {
      text-align: center;
      margin: 30px 0;
    }

    .auth-link p {
      color: #666;
      margin: 0;
    }

    .register-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .register-link:hover {
      color: #5a6fd8;
      transform: translateX(3px);
    }

    .link-arrow {
      transition: all 0.2s ease;
    }

    .register-link:hover .link-arrow {
      transform: translateX(3px);
    }

    .nav-links {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e1e5e9;
    }

    .nav-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      padding: 10px 20px;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .nav-link:hover {
      background: rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
    }

    .nav-icon {
      font-size: 18px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .auth-wrapper {
        padding: 10px;
      }

      .auth-container {
        flex-direction: column;
        max-width: 100%;
        min-height: auto;
        border-radius: 15px;
      }

      .welcome-section {
        padding: 40px 30px;
        text-align: center;
      }

      .welcome-title {
        font-size: 2rem;
      }

      .features-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }

      .feature-item {
        padding: 12px 15px;
      }

      .form-section {
        padding: 40px 30px;
      }

      .social-buttons {
        flex-direction: column;
      }
    }

    @media (max-width: 480px) {
      .welcome-section, .form-section {
        padding: 30px 20px;
      }

      .welcome-title {
        font-size: 1.8rem;
      }

      .features-list {
        grid-template-columns: 1fr;
      }

      .form-options {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  form: LoginRequest = {
    email: '',
    password: ''
  };

  loading = false;
  error: string | null = null;
  success: string | null = null;
  showPassword = false;
  rememberMe = false;
  emailError: string | null = null;
  passwordError: string | null = null;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Check if user wants to be remembered
    const rememberMe = localStorage.getItem('rememberMe');
    const savedEmail = localStorage.getItem('userEmail');
    
    if (rememberMe === 'true' && savedEmail) {
      this.rememberMe = true;
      this.form.email = savedEmail;
    }

    // Check if user is already logged in
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Handle both string and object role formats
        const roleName = typeof user.role === 'string' ? user.role : user.role?.roleName;
        const isAdmin = roleName === 'ADMIN' || roleName === 'Admin';
        if (isAdmin) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/tours']);
        }
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.clearMessages();
    this.loading = true;

    this.authService.login(this.form).subscribe({
      next: (response) => {
        // Show success toast
        this.toastService.success('Đăng nhập thành công!');
        
        // Handle remember me functionality
        if (this.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('userEmail', this.form.email);
        } else {
          this.clearRememberMe();
        }
        
        // Check user role and redirect accordingly
        const user = response.user;
        // Handle both string and object role formats
        const roleName = typeof user?.role === 'string' ? user.role : user?.role?.roleName;
        const isAdmin = roleName === 'ADMIN' || roleName === 'Admin';
        
        // Redirect based on role
        setTimeout(() => {
          if (isAdmin) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/tours']);
          }
        }, 1000);
      },
      error: (error) => {
        console.error('Login error:', error);
        const errorMsg = error.error?.message || error.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        this.error = errorMsg;
        this.loading = false;
        
        // Show error toast
        this.toastService.error(errorMsg);
        
        // Reset password field on error for security
        this.form.password = '';
      }
    });
  }

  validateForm(): boolean {
    let isValid = true;
    
    // Reset errors
    this.emailError = null;
    this.passwordError = null;

    // Sanitize email input
    if (this.form.email) {
      this.form.email = this.form.email.trim().toLowerCase();
    }

    // Validate email using shared utility
    if (!this.form.email) {
      this.emailError = 'Vui lòng nhập email';
      isValid = false;
    } else if (!ValidationUtils.isValidEmail(this.form.email)) {
      this.emailError = 'Email không hợp lệ';
      isValid = false;
    }

    // Validate password
    if (!this.form.password) {
      this.passwordError = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (this.form.password.length < 6) {
      this.passwordError = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    } else if (this.form.password.length > 50) {
      this.passwordError = 'Mật khẩu không được vượt quá 50 ký tự';
      isValid = false;
    }

    return isValid;
  }

  validateEmail(): void {
    if (this.form.email) {
      this.form.email = this.form.email.trim().toLowerCase();
      if (!ValidationUtils.isValidEmail(this.form.email)) {
        this.emailError = 'Email không hợp lệ';
      } else {
        this.emailError = null;
      }
    } else {
      this.emailError = null;
    }
  }

  isValidEmail(email: string): boolean {
    return ValidationUtils.isValidEmail(email);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private clearRememberMe(): void {
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('userEmail');
  }

  private clearMessages(): void {
    this.error = null;
    this.success = null;
  }
}