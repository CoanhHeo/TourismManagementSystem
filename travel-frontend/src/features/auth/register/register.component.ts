import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../app/core/services/api/auth.service';
import { RegisterRequest } from '../../../app/shared/models/interfaces';
import { VIETNAMESE_PROVINCES } from '../../../app/shared/utils/constants';
import { ValidationUtils } from '../../../app/shared/utils/utils';
import { ToastService } from '../../../app/shared/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <!-- Background shapes -->
      <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>

      <div class="auth-container">
        <!-- Welcome Section -->
        <div class="welcome-section">
          <div class="welcome-content">
            <div class="logo-section">
              <div class="logo">
                <span class="logo-icon">🌴</span>
                <span class="logo-text">TravelCo</span>
              </div>
            </div>
            
            <h1 class="welcome-title">Tham gia cùng chúng tôi</h1>
            <p class="welcome-subtitle">
              Khám phá những chuyến du lịch tuyệt vời và tạo ra những kỷ niệm đáng nhớ
            </p>
            
            <div class="benefits-list">
              <div class="benefit-item">
                <span class="benefit-icon">✈️</span>
                <span>Đặt tour du lịch dễ dàng</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">💝</span>
                <span>Ưu đãi hấp dẫn cho thành viên</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">🎯</span>
                <span>Quản lý lịch trình cá nhân</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">🌟</span>
                <span>Đánh giá và chia sẻ trải nghiệm</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Section -->
        <div class="form-section">
          <div class="form-container">
            <div class="form-header">
              <h2 class="form-title">Tạo tài khoản mới</h2>
              <p class="form-subtitle">
                Điền thông tin để bắt đầu hành trình khám phá
              </p>
            </div>
            
            <!-- Registration Form -->
            <form (ngSubmit)="onSubmit()" #f="ngForm" class="auth-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    <span class="input-icon">👤</span>
                    Họ và tên *
                  </label>
                  <input 
                    type="text" 
                    [(ngModel)]="form.fullname" 
                    name="fullname" 
                    required 
                    placeholder="Nhập họ và tên đầy đủ"
                    class="form-input"
                    [class.error]="nameError"
                    (blur)="validateName()"
                  />
                  <div *ngIf="nameError" class="field-error">{{ nameError }}</div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <span class="input-icon">🎂</span>
                    Tuổi *
                  </label>
                  <input 
                    type="number" 
                    [(ngModel)]="form.age" 
                    name="age" 
                    required 
                    min="16" 
                    max="100"
                    placeholder="Nhập tuổi (16-100)"
                    class="form-input"
                    [class.error]="ageError"
                    (focus)="onAgeInputFocus($event)"
                    (blur)="validateAge()"
                  />
                  <div *ngIf="ageError" class="field-error">{{ ageError }}</div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    <span class="input-icon">⚧️</span>
                    Giới tính *
                  </label>
                  <select 
                    [(ngModel)]="form.gender" 
                    name="gender" 
                    required
                    class="form-input"
                    [class.error]="genderError"
                    (blur)="validateGender()"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                  </select>
                  <div *ngIf="genderError" class="field-error">{{ genderError }}</div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <span class="input-icon">🏠</span>
                    Quê quán
                  </label>
                  <select 
                    [(ngModel)]="form.address" 
                    name="address" 
                    class="form-input province-select"
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    <option *ngFor="let province of vietnameseProvinces" [value]="province">
                      {{ province }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="input-icon">📧</span>
                  Email *
                </label>
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
                <div *ngIf="emailError" class="field-error">{{ emailError }}</div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="input-icon">📱</span>
                  Số điện thoại *
                </label>
                <input 
                  type="tel" 
                  [(ngModel)]="form.phoneNumber" 
                  name="phoneNumber" 
                  required 
                  pattern="^(\\+84|0)[3-9][0-9]{8}$"
                  placeholder="Nhập số điện thoại (VD: 0987654321)"
                  class="form-input"
                  [class.error]="phoneError"
                  (blur)="validatePhone()"
                />
                <div *ngIf="phoneError" class="field-error">{{ phoneError }}</div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="input-icon">🔒</span>
                  Mật khẩu *
                </label>
                <div class="input-wrapper">
                  <input 
                    [type]="showPassword ? 'text' : 'password'" 
                    [(ngModel)]="form.password" 
                    name="password" 
                    required 
                    minlength="8"
                    maxlength="12"
                    placeholder="8-12 ký tự, có chữ hoa, thường, số, ký tự đặc biệt"
                    class="form-input"
                    [class.error]="passwordError"
                    (blur)="validatePassword()"
                  />
                  <button 
                    type="button" 
                    class="password-toggle" 
                    (click)="togglePassword()"
                  >
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
                <div *ngIf="passwordError" class="field-error">{{ passwordError }}</div>
                <div class="password-strength" *ngIf="form.password">
                  <div class="strength-indicator">
                    <div class="strength-bar" [class]="getPasswordStrength()"></div>
                  </div>
                  <span class="strength-text">{{ getPasswordStrengthText() }}</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="input-icon">🔐</span>
                  Xác nhận mật khẩu *
                </label>
                <div class="input-wrapper">
                  <input 
                    [type]="showConfirmPassword ? 'text' : 'password'" 
                    [(ngModel)]="form.confirmPassword" 
                    name="confirmPassword" 
                    required 
                    placeholder="Nhập lại mật khẩu"
                    class="form-input"
                    [class.error]="confirmPasswordError"
                    (blur)="validateConfirmPassword()"
                  />
                  <button 
                    type="button" 
                    class="password-toggle" 
                    (click)="toggleConfirmPassword()"
                  >
                    {{ showConfirmPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
                <div *ngIf="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</div>
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="form.acceptTerms" 
                    name="acceptTerms" 
                    required
                  />
                  <span class="checkmark"></span>
                  Tôi đồng ý với <a href="#" class="terms-link">Điều khoản và Chính sách</a> của dịch vụ
                </label>
              </div>

              <button type="submit" [disabled]="!f.valid || loading" class="btn-primary">
                <div class="btn-content" *ngIf="!loading">
                  <span class="btn-icon">🚀</span>
                  <span>Tạo tài khoản</span>
                </div>
                <div class="btn-loading" *ngIf="loading">
                  <div class="spinner"></div>
                  <span>Đang xử lý...</span>
                </div>
              </button>
            </form>

            <!-- Alert Messages -->
            <div *ngIf="error" class="alert alert-error">
              <span class="alert-icon">❌</span>
              <span>{{ error }}</span>
            </div>
            <div *ngIf="success" class="alert alert-success">
              <span class="alert-icon">✅</span>
              <span>{{ success }}</span>
            </div>

            <!-- Navigation Links -->
            <div class="auth-link">
              <p>Đã có tài khoản? 
                <a routerLink="/login" class="login-link">
                  Đăng nhập ngay
                  <span class="link-arrow">→</span>
                </a>
              </p>
            </div>

            <div class="nav-links">
              <a routerLink="/tours" class="nav-link">
                <span class="nav-icon">🌍</span>
                <span>Khám phá Tours</span>
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
      width: 100px;
      height: 100px;
      top: 15%;
      left: 10%;
      animation-delay: 0s;
    }

    .shape-2 {
      width: 150px;
      height: 150px;
      top: 70%;
      right: 10%;
      animation-delay: 3s;
    }

    .shape-3 {
      width: 80px;
      height: 80px;
      bottom: 15%;
      left: 25%;
      animation-delay: 1.5s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    .auth-container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      display: flex;
      max-width: 1200px;
      width: 100%;
      max-height: 95vh;
      position: relative;
      z-index: 2;
    }

    .welcome-section {
      flex: 1;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
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
      margin-bottom: 25px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .logo-icon {
      font-size: 2rem;
      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .welcome-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 15px;
      line-height: 1.2;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .welcome-subtitle {
      font-size: 1rem;
      line-height: 1.5;
      opacity: 0.9;
      margin-bottom: 25px;
    }

    .benefits-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .benefit-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 15px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .benefit-item:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateX(5px);
    }

    .benefit-icon {
      font-size: 1.5rem;
    }

    .form-section {
      flex: 1.2;
      padding: 20px;
      display: flex;
      align-items: flex-start;
      overflow-y: auto;
      max-height: 95vh;
    }

    .form-container {
      width: 100%;
      max-width: 500px;
      margin: auto;
      padding: 10px;
    }

    .form-header {
      text-align: center;
      margin-bottom: 15px;
    }

    .form-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 6px;
    }

    .form-subtitle {
      color: #666;
      font-size: 0.85rem;
      line-height: 1.3;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 5px;
      font-weight: 600;
      color: #333;
      font-size: 12px;
    }

    .input-icon {
      font-size: 14px;
    }

    .input-wrapper {
      position: relative;
    }

    .form-input {
      width: 100%;
      padding: 8px 12px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 13px;
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

    .province-select {
      background-color: #f8f9fa;
      cursor: pointer;
    }

    .province-select:focus {
      background-color: white;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 5px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .password-toggle:hover {
      background: rgba(102, 126, 234, 0.1);
    }

    .field-error {
      color: #dc3545;
      font-size: 11px;
      margin-top: 2px;
    }

    .password-strength {
      margin-top: 4px;
    }

    .strength-indicator {
      height: 3px;
      background: #e1e5e9;
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 3px;
    }

    .strength-bar {
      height: 100%;
      border-radius: 2px;
      transition: all 0.3s ease;
    }

    .strength-bar.weak {
      width: 33%;
      background: #dc3545;
    }

    .strength-bar.medium {
      width: 66%;
      background: #ffc107;
    }

    .strength-bar.strong {
      width: 100%;
      background: #28a745;
    }

    .strength-text {
      font-size: 11px;
      font-weight: 500;
    }

    .strength-text.weak {
      color: #dc3545;
    }

    .strength-text.medium {
      color: #ffc107;
    }

    .strength-text.strong {
      color: #28a745;
    }

    .checkbox-group {
      margin: 8px 0;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      font-size: 12px;
      color: #666;
      line-height: 1.3;
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
      flex-shrink: 0;
      margin-top: 1px;
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

    .terms-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .terms-link:hover {
      text-decoration: underline;
    }

    .btn-primary {
      padding: 12px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      padding: 10px 20px;
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
    }

    .btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-icon {
      font-size: 16px;
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
      padding: 10px 14px;
      border-radius: 8px;
      margin: 12px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      font-size: 13px;
    }    .alert-error {
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

    .auth-link {
      text-align: center;
      margin: 20px 0 15px;
    }

    .auth-link p {
      color: #666;
      margin: 0;
      font-size: 14px;
    }

    .login-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .login-link:hover {
      color: #5a6fd8;
      transform: translateX(3px);
    }

    .link-arrow {
      transition: all 0.2s ease;
    }

    .login-link:hover .link-arrow {
      transform: translateX(3px);
    }

    .nav-links {
      text-align: center;
      padding-top: 15px;
      border-top: 1px solid #e1e5e9;
    }

    .nav-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      transition: all 0.2s ease;
      font-size: 14px;
    }

    .nav-link:hover {
      background: rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
    }

    .nav-icon {
      font-size: 18px;
    }

    /* Responsive Design */
    @media (max-width: 968px) {
      .auth-wrapper {
        padding: 15px;
      }

      .auth-container {
        flex-direction: column;
        max-width: 100%;
        min-height: auto;
      }

      .welcome-section {
        padding: 40px 30px;
        text-align: center;
      }

      .welcome-title {
        font-size: 2rem;
      }

      .benefits-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }

      .form-section {
        padding: 40px 30px;
        max-height: none;
      }
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .benefits-list {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .welcome-section, .form-section {
        padding: 30px 20px;
      }

      .welcome-title {
        font-size: 1.8rem;
      }

      .form-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class RegisterComponent {
  form: RegisterRequest = {
    fullname: '',
    age: null as any,
    gender: '',
    address: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  };

  // Vietnamese provinces list
  vietnameseProvinces = VIETNAMESE_PROVINCES;

  loading = false;
  error: string | null = null;
  success: string | null = null;

  // Validation properties
  nameError: string | null = null;
  ageError: string | null = null;
  genderError: string | null = null;
  emailError: string | null = null;
  phoneError: string | null = null;
  passwordError: string | null = null;
  confirmPasswordError: string | null = null;
  
  // Password visibility toggles
  showPassword = false;
  showConfirmPassword = false;

  constructor(private authService: AuthService, private router: Router, private toastService: ToastService) {}

  onAgeInputFocus(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value === '0' || this.form.age === 0) {
      this.form.age = null as any;
      input.value = '';
    }
  }

  // Validation methods
  validateName(): void {
    if (!this.form.fullname.trim()) {
      this.nameError = 'Vui lòng nhập họ và tên';
    } else if (this.form.fullname.trim().length < 2) {
      this.nameError = 'Họ và tên phải có ít nhất 2 ký tự';
    } else {
      this.nameError = null;
    }
  }

  validateAge(): void {
    if (!this.form.age) {
      this.ageError = 'Vui lòng nhập tuổi';
    } else if (this.form.age < 16) {
      this.ageError = 'Tuổi phải từ 16 trở lên';
    } else if (this.form.age > 100) {
      this.ageError = 'Tuổi không được vượt quá 100';
    } else {
      this.ageError = null;
    }
  }

  validateGender(): void {
    if (!this.form.gender || this.form.gender.trim() === '') {
      this.genderError = 'Vui lòng chọn giới tính';
    } else {
      this.genderError = null;
    }
  }

  validateEmail(): void {
    if (this.form.email && !ValidationUtils.isValidEmail(this.form.email)) {
      this.emailError = 'Email không hợp lệ';
    } else {
      this.emailError = null;
    }
  }

  validatePhone(): void {
    if (!this.form.phoneNumber) {
      this.phoneError = 'Vui lòng nhập số điện thoại';
    } else if (!ValidationUtils.isValidVietnamesePhone(this.form.phoneNumber)) {
      this.phoneError = 'Số điện thoại không hợp lệ (VD: 0987654321)';
    } else {
      this.phoneError = null;
    }
  }

  validatePassword(): void {
    const validation = ValidationUtils.validatePassword(this.form.password || '');
    this.passwordError = validation.errors.length > 0 ? validation.errors[0] : null;
  }

  validateConfirmPassword(): void {
    if (!this.form.confirmPassword) {
      this.confirmPasswordError = 'Vui lòng xác nhận mật khẩu';
    } else if (this.form.password !== this.form.confirmPassword) {
      this.confirmPasswordError = 'Mật khẩu xác nhận không khớp';
    } else {
      this.confirmPasswordError = null;
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+84|0)[3-9][0-9]{8}$/;
    return phoneRegex.test(phone);
  }

  isValidPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  getPasswordStrength(): string {
    if (!this.form.password) return '';
    
    let score = 0;
    if (this.form.password.length >= 8) score++;
    if (/[A-Z]/.test(this.form.password)) score++;
    if (/[a-z]/.test(this.form.password)) score++;
    if (/\d/.test(this.form.password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(this.form.password)) score++;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Yếu';
      case 'medium': return 'Trung bình';
      case 'strong': return 'Mạnh';
      default: return '';
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    // Validate all fields
    this.validateName();
    this.validateAge();
    this.validateGender();
    this.validateEmail();
    this.validatePhone();
    this.validatePassword();
    this.validateConfirmPassword();

    // Check if there are any validation errors
    if (this.nameError || this.ageError || this.genderError || this.emailError || this.phoneError || 
        this.passwordError || this.confirmPasswordError) {
      this.error = 'Vui lòng sửa các lỗi trong form';
      return;
    }

    // Ensure age is a valid number before submitting
    if (this.form.age === null || this.form.age === undefined || this.form.age === 0) {
      this.error = 'Vui lòng nhập tuổi hợp lệ';
      return;
    }

    this.error = null;
    this.success = null;
    this.loading = true;

    this.authService.register(this.form).subscribe({
      next: (response) => {
        this.toastService.success('Đăng ký thành công, đang chuyển hướng đến trang đăng nhập!');
        this.loading = false;
        
        // Redirect to login after successful registration
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.error = error.error?.message || 'Đăng ký thất bại';
        this.loading = false;
      }
    });
  }
}