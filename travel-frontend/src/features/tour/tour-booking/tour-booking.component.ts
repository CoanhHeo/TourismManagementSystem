import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TourService } from '../../../app/core/services/api/tour.service';
import { TourBookingService } from '../../../app/core/services/api/tour-booking.service';
import { TourDepartureService } from '../../../app/core/services/api/tour-departure.service';
import { AuthService } from '../../../app/core/services/api/auth.service';
import { ToastService } from '../../../app/shared/services/toast.service';
import { Tour, KhachHang, TourBooking, TourDeparture, Promotion } from '../../../app/shared/models/interfaces';

@Component({
  selector: 'app-tour-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="booking-wrapper">
      <div class="booking-container">
        <!-- Back Button -->
        <button class="back-btn" (click)="goBack()">
          <i class="icon">←</i>
          <span>Quay lại danh sách tour</span>
        </button>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-section">
          <div class="spinner-large"></div>
          <p>Đang tải thông tin tour...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" class="error-section">
          <i class="error-icon">⚠️</i>
          <h3>{{ error }}</h3>
          <button class="btn-primary" (click)="loadTour()">Thử lại</button>
        </div>

        <!-- Main Content -->
        <div *ngIf="!loading && !error && tour" class="booking-content">
          <!-- Tour Information -->
          <div class="tour-info-section">
            <div class="section-header">
              <h2 class="section-title">
                <i class="icon">🎫</i>
                Thông tin tour
              </h2>
            </div>

            <div class="tour-card-detail">
              <div class="tour-image">
                <img [src]="getTourImage()" alt="{{ getTourName() }}" (error)="onImageError($event)">
                <div class="tour-badge" [class.full]="isDepartureFull()">
                  {{ getTourStatusBadge() }}
                </div>
              </div>

              <div class="tour-details">
                <h1 class="tour-title">{{ getTourName() }}</h1>
                
                <div class="detail-grid">
                  <div class="detail-item">
                    <i class="detail-icon">📍</i>
                    <div class="detail-content">
                      <span class="detail-label">Điểm đến</span>
                      <span class="detail-value">{{ getTourDestination() }}</span>
                    </div>
                  </div>

                  <div class="detail-item" *ngIf="selectedDeparture">
                    <i class="detail-icon">🚩</i>
                    <div class="detail-content">
                      <span class="detail-label">Điểm tập trung</span>
                      <span class="detail-value">{{ selectedDeparture.departureLocation }}</span>
                    </div>
                  </div>

                  <div class="detail-item" *ngIf="selectedDeparture">
                    <i class="detail-icon">📅</i>
                    <div class="detail-content">
                      <span class="detail-label">Khởi hành</span>
                      <span class="detail-value">{{ formatDateTime(selectedDeparture.departureTime) }}</span>
                    </div>
                  </div>

                  <div class="detail-item" *ngIf="selectedDeparture">
                    <i class="detail-icon">🏁</i>
                    <div class="detail-content">
                      <span class="detail-label">Kết thúc</span>
                      <span class="detail-value">{{ formatDateTime(selectedDeparture.returnTime) }}</span>
                    </div>
                  </div>

                  <div class="detail-item" *ngIf="selectedDeparture">
                    <i class="detail-icon">💰</i>
                    <div class="detail-content">
                      <span class="detail-label">Giá tour</span>
                      <div class="price-container">
                        <span class="detail-value price" [class.has-discount]="hasActivePromotion()">
                          {{ formatPrice(selectedDeparture.originalPrice) }}₫
                        </span>
                        <span *ngIf="hasActivePromotion()" class="discount-badge">
                          -{{ getPromotionPercent() }}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Promotion Information -->
                  <div class="detail-item promotion-highlight" *ngIf="hasActivePromotion() && selectedDeparture?.promotion">
                    <i class="detail-icon">🎁</i>
                    <div class="detail-content">
                      <span class="detail-label">Khuyến mãi</span>
                      <div class="promotion-details">
                        <span class="promotion-name">{{ selectedDeparture?.promotion?.promotionName || 'Khuyến mãi' }}</span>
                        <span class="promotion-discount">Giảm {{ selectedDeparture?.promotion?.percent || 0 }}%</span>
                        <span class="promotion-final-price">
                          Chỉ còn: <strong>{{ formatPrice(calculateDiscountedPrice()) }}₫</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="detail-item" *ngIf="selectedDeparture">
                    <i class="detail-icon">👥</i>
                    <div class="detail-content">
                      <span class="detail-label">Số chỗ còn lại</span>
                      <span class="detail-value" [class.low]="isLowAvailability()">
                        {{ getAvailableSeats() }}/{{ selectedDeparture.maxQuantity }} chỗ
                      </span>
                    </div>
                  </div>

                  <div class="detail-item">
                    <i class="detail-icon">⏱️</i>
                    <div class="detail-content">
                      <span class="detail-label">Thời gian</span>
                      <span class="detail-value">{{ getDuration() }}</span>
                    </div>
                  </div>
                </div>

                <div *ngIf="tour.moTa || tour.description" class="tour-description">
                  <h3>Mô tả chi tiết</h3>
                  <p>{{ tour.moTa || tour.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Departure Selection -->
          <div class="departure-selection-section">
            <div class="section-header">
              <h2 class="section-title">
                <i class="icon">📅</i>
                Chọn lịch khởi hành
              </h2>
            </div>

            <!-- Loading Departures -->
            <div *ngIf="loadingDepartures" class="loading-departures">
              <div class="spinner-small"></div>
              <p>Đang tải lịch khởi hành...</p>
            </div>

            <!-- No Departures -->
            <div *ngIf="!loadingDepartures && departures.length === 0" class="no-departures">
              <i class="warning-icon">📅</i>
              <h3>Chưa có lịch khởi hành</h3>
              <p>Hiện tại tour chưa có lịch khởi hành. Vui lòng quay lại sau.</p>
            </div>

            <!-- Departure List -->
            <div *ngIf="!loadingDepartures && departures.length > 0" class="departure-list">
              <div 
                *ngFor="let departure of departures; let i = index"
                class="departure-card"
                [class.selected]="selectedDeparture?.tourDepartureID === departure.tourDepartureID"
                [class.full]="departure.availableSlots !== undefined && departure.availableSlots <= 0"
                (click)="selectDeparture(departure)"
              >
                <div class="departure-header">
                  <div class="departure-number">Lịch #{{ i + 1 }}</div>
                  <div class="departure-status">
                    <span class="status-badge" 
                          [class.available]="departure.availableSlots !== undefined && departure.availableSlots > 10"
                          [class.low]="departure.availableSlots !== undefined && departure.availableSlots > 0 && departure.availableSlots <= 10"
                          [class.full]="departure.availableSlots !== undefined && departure.availableSlots <= 0">
                      {{ departure.availableSlots !== undefined && departure.availableSlots <= 0 ? 'Đã đầy' : 
                         departure.availableSlots !== undefined && departure.availableSlots <= 10 ? 'Sắp đầy' : 'Còn chỗ' }}
                    </span>
                  </div>
                </div>

                <div class="departure-body">
                  <div class="departure-info">
                    <div class="info-row">
                      <i class="info-icon">🚩</i>
                      <div class="info-content">
                        <span class="info-label">Điểm tập trung:</span>
                        <span class="info-value">{{ departure.departureLocation }}</span>
                      </div>
                    </div>

                    <div class="info-row">
                      <i class="info-icon">📅</i>
                      <div class="info-content">
                        <span class="info-label">Khởi hành:</span>
                        <span class="info-value">{{ formatDateTime(departure.departureTime) }}</span>
                      </div>
                    </div>

                    <div class="info-row">
                      <i class="info-icon">🏁</i>
                      <div class="info-content">
                        <span class="info-label">Kết thúc:</span>
                        <span class="info-value">{{ formatDateTime(departure.returnTime) }}</span>
                      </div>
                    </div>

                    <div class="info-row">
                      <i class="info-icon">⏱️</i>
                      <div class="info-content">
                        <span class="info-label">Thời gian:</span>
                        <span class="info-value">{{ departure.dayNum }} ngày {{ departure.dayNum - 1 }} đêm</span>
                      </div>
                    </div>
                  </div>

                  <div class="departure-pricing">
                    <div class="price-row">
                      <span class="price-label">Giá:</span>
                      <span class="price-value">{{ formatPrice(departure.originalPrice) }}₫/người</span>
                    </div>
                    <div class="availability-row">
                      <span class="availability-label">Còn lại:</span>
                      <span class="availability-value">{{ departure.availableSlots !== undefined ? departure.availableSlots : departure.maxQuantity }}/{{ departure.maxQuantity }} chỗ</span>
                    </div>
                  </div>
                </div>

                <div class="departure-footer" *ngIf="selectedDeparture?.tourDepartureID === departure.tourDepartureID">
                  <i class="check-icon">✓</i>
                  <span>Đã chọn</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Booking Form -->
          <div class="booking-form-section">
            <div class="section-header">
              <h2 class="section-title">
                <i class="icon">✍️</i>
                Đăng ký tour
              </h2>
            </div>

            <!-- Not Logged In Message -->
            <div *ngIf="!currentUser" class="login-required">
              <i class="warning-icon">🔐</i>
              <h3>Vui lòng đăng nhập để đăng ký tour</h3>
              <p>Bạn cần có tài khoản để tiếp tục đăng ký tour du lịch</p>
              <div class="login-actions">
                <button class="btn-primary" (click)="navigateToLogin()">
                  <i class="icon">🔑</i>
                  Đăng nhập
                </button>
                <button class="btn-secondary" (click)="navigateToRegister()">
                  <i class="icon">👤</i>
                  Đăng ký tài khoản
                </button>
              </div>
            </div>

            <!-- Booking Form -->
            <form *ngIf="currentUser" (ngSubmit)="onSubmit()" #bookingForm="ngForm" class="booking-form">
              <div class="form-group">
                <label class="form-label">
                  <i class="icon">👤</i>
                  Họ và tên
                </label>
                <input 
                  type="text" 
                  class="form-input" 
                  [value]="currentUser.fullname || currentUser.tenKhachHang" 
                  disabled
                >
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="icon">📧</i>
                  Email
                </label>
                <input 
                  type="email" 
                  class="form-input" 
                  [value]="currentUser.email" 
                  disabled
                >
              </div>

              <div class="form-group">
                <label class="form-label required">
                  <i class="icon">👥</i>
                  Số lượng người (tối đa 10 người/lần đăng ký)
                </label>
                <div class="quantity-selector">
                  <button 
                    type="button" 
                    class="qty-btn" 
                    (click)="decreaseQuantity()"
                    [disabled]="booking.soLuong <= 1"
                  >
                    <i>−</i>
                  </button>
                  <input 
                    type="number" 
                    [(ngModel)]="booking.soLuong" 
                    name="soLuong" 
                    required 
                    min="1" 
                    max="10"
                    class="qty-input"
                    (change)="validateQuantity()"
                  >
                  <button 
                    type="button" 
                    class="qty-btn" 
                    (click)="increaseQuantity()"
                    [disabled]="booking.soLuong >= 10 || booking.soLuong >= getAvailableSeats()"
                  >
                    <i>+</i>
                  </button>
                </div>
                <div *ngIf="quantityError" class="field-error">{{ quantityError }}</div>
              </div>

              <div class="booking-summary">
                <h3>Tổng quan đăng ký</h3>
                
                <!-- Selected Departure Info -->
                <div *ngIf="selectedDeparture" class="selected-departure-info">
                  <div class="summary-item">
                    <span class="summary-label">Lịch khởi hành:</span>
                    <span class="summary-value">{{ formatDate(selectedDeparture.departureTime) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Điểm tập trung:</span>
                    <span class="summary-value">{{ selectedDeparture.departureLocation }}</span>
                  </div>
                </div>

                <!-- No Departure Selected Warning -->
                <div *ngIf="!selectedDeparture" class="no-departure-warning">
                  <i class="warning-icon">⚠️</i>
                  <p>Vui lòng chọn lịch khởi hành ở phía trên</p>
                </div>

                <!-- Pricing Summary -->
                <div class="summary-grid" *ngIf="selectedDeparture">
                  <div class="summary-item">
                    <span class="summary-label">Số người:</span>
                    <span class="summary-value">{{ booking.soLuong }} người</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Giá/người:</span>
                    <span class="summary-value" [class.crossed-out]="hasActivePromotion()">
                      {{ formatPrice(selectedDeparture.originalPrice) }}₫
                    </span>
                  </div>
                  
                  <!-- Discount Information -->
                  <div *ngIf="hasActivePromotion()" class="summary-item discount">
                    <span class="summary-label">
                      <i class="icon">🎁</i> Giảm giá ({{ getPromotionPercent() }}%):
                    </span>
                    <span class="summary-value discount-amount">
                      -{{ formatPrice(getDiscountAmount() * booking.soLuong) }}₫
                    </span>
                  </div>
                  
                  <div *ngIf="hasActivePromotion()" class="summary-item discounted-price">
                    <span class="summary-label">Giá sau giảm:</span>
                    <span class="summary-value price-highlight">
                      {{ formatPrice(calculateDiscountedPrice()) }}₫/người
                    </span>
                  </div>
                  
                  <div class="summary-divider" *ngIf="hasActivePromotion()"></div>
                  
                  <div class="summary-item total">
                    <span class="summary-label">Tổng thanh toán:</span>
                    <span class="summary-value">{{ formatPrice(getTotalPrice()) }}₫</span>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  class="btn-submit" 
                  [disabled]="submitting || !selectedDeparture || isDepartureFull() || !bookingForm.valid"
                  [class.loading]="submitting"
                >
                  <span *ngIf="!submitting">
                    <i class="icon">✅</i>
                    Xác nhận đăng ký
                  </span>
                  <span *ngIf="submitting" class="btn-loading">
                    <div class="spinner"></div>
                    Đang xử lý...
                  </span>
                </button>
              </div>

              <div class="booking-notes">
                <h4>Lưu ý:</h4>
                <ul>
                  <li>Vui lòng chọn lịch khởi hành phù hợp với kế hoạch của bạn</li>
                  <li>Mỗi lần đăng ký tối đa 10 người</li>
                  <li>Số chỗ có hạn, đăng ký sớm để đảm bảo chỗ</li>
                  <li>Vui lòng kiểm tra kỹ thông tin trước khi xác nhận</li>
                  <li>Sau khi đăng ký thành công, chúng tôi sẽ liên hệ qua email</li>
                </ul>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-wrapper {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .booking-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      margin-bottom: 20px;
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateX(-5px);
    }

    .loading-section, .error-section {
      background: white;
      padding: 60px 20px;
      border-radius: 20px;
      text-align: center;
    }

    .spinner-large {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(102, 126, 234, 0.3);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-icon {
      font-size: 60px;
      margin-bottom: 20px;
    }

    .booking-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    @media (max-width: 968px) {
      .booking-content {
        grid-template-columns: 1fr;
      }
    }

    .tour-info-section, .booking-form-section, .departure-selection-section {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .departure-selection-section {
      margin: 20px 0;
    }

    .section-header {
      margin-bottom: 25px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
      color: #333;
      margin: 0;
    }

    .tour-card-detail {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .tour-image {
      position: relative;
      width: 100%;
      height: 300px;
      border-radius: 15px;
      overflow: hidden;
    }

    .tour-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .tour-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      padding: 8px 16px;
      background: rgba(76, 175, 80, 0.9);
      color: white;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      backdrop-filter: blur(10px);
    }

    .tour-badge.full {
      background: rgba(244, 67, 54, 0.9);
    }

    .tour-title {
      font-size: 28px;
      color: #333;
      margin: 0 0 20px 0;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .detail-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .detail-value {
      font-size: 16px;
      color: #333;
      font-weight: 600;
    }

    .detail-value.price {
      color: #667eea;
      font-size: 18px;
    }

    .detail-value.price.has-discount {
      text-decoration: line-through;
      color: #999;
      font-size: 16px;
    }

    .price-container {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .discount-badge {
      background: linear-gradient(135deg, #ff6b6b, #ff3838);
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(255, 59, 59, 0.3);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .detail-item.promotion-highlight {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(255, 107, 107, 0.1));
      border: 2px solid #667eea;
      border-radius: 10px;
      padding: 15px;
      animation: highlight 3s ease-in-out infinite;
    }

    @keyframes highlight {
      0%, 100% { border-color: #667eea; }
      50% { border-color: #ff6b6b; }
    }

    .promotion-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .promotion-name {
      color: #667eea;
      font-weight: 700;
      font-size: 15px;
    }

    .promotion-discount {
      color: #ff6b6b;
      font-weight: 600;
      font-size: 14px;
    }

    .promotion-final-price {
      color: #28a745;
      font-weight: 700;
      font-size: 16px;
      margin-top: 4px;
    }

    .promotion-final-price strong {
      font-size: 18px;
    }

    .detail-value.low {
      color: #ff9800;
    }

    .tour-description {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }

    .tour-description h3 {
      margin: 0 0 10px 0;
      color: #667eea;
      font-size: 18px;
    }

    .tour-description p {
      margin: 0;
      color: #666;
      line-height: 1.6;
    }

    .login-required {
      text-align: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
      border-radius: 15px;
    }

    .warning-icon {
      font-size: 60px;
      margin-bottom: 20px;
    }

    .login-required h3 {
      color: #333;
      margin: 0 0 10px 0;
    }

    .login-required p {
      color: #666;
      margin: 0 0 30px 0;
    }

    .login-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .booking-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
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

    .form-label.required::after {
      content: '*';
      color: #f44336;
      margin-left: 4px;
    }

    .form-input {
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .qty-btn {
      width: 40px;
      height: 40px;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 10px;
      cursor: pointer;
      font-size: 20px;
      font-weight: bold;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qty-btn:hover:not(:disabled) {
      border-color: #667eea;
      color: #667eea;
    }

    .qty-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .qty-input {
      flex: 1;
      text-align: center;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 18px;
      font-weight: 600;
    }

    .field-error {
      color: #f44336;
      font-size: 13px;
      margin-top: 4px;
    }

    .booking-summary {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
      padding: 20px;
      border-radius: 12px;
    }

    .booking-summary h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 18px;
    }

    .summary-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .summary-item.total {
      border-bottom: none;
      border-top: 2px solid #667eea;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 18px;
    }

    .summary-item.discount {
      background: rgba(255, 107, 107, 0.1);
      padding: 10px;
      border-radius: 8px;
      border: 1px dashed #ff6b6b;
    }

    .summary-item.discount .summary-label {
      color: #ff6b6b;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .summary-item.discount .summary-value {
      color: #ff6b6b;
      font-weight: 700;
    }

    .summary-item.discounted-price {
      background: rgba(40, 167, 69, 0.1);
      padding: 10px;
      border-radius: 8px;
      border: 1px solid rgba(40, 167, 69, 0.3);
    }

    .summary-item.discounted-price .summary-label {
      color: #28a745;
    }

    .summary-item.discounted-price .price-highlight {
      color: #28a745;
      font-weight: 700;
      font-size: 16px;
    }

    .summary-divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #667eea, transparent);
      margin: 10px 0;
    }

    .crossed-out {
      text-decoration: line-through;
      color: #999 !important;
      font-size: 14px !important;
    }

    .summary-label {
      color: #666;
      font-weight: 500;
    }

    .summary-value {
      color: #333;
      font-weight: 600;
    }

    .summary-item.total .summary-value {
      color: #667eea;
      font-size: 24px;
    }

    .btn-submit {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      color: white;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .btn-secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-primary:hover, .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .booking-notes {
      background: #fff3cd;
      padding: 15px;
      border-radius: 10px;
      border-left: 4px solid #ffc107;
    }

    .booking-notes h4 {
      margin: 0 0 10px 0;
      color: #856404;
      font-size: 16px;
    }

    .booking-notes ul {
      margin: 0;
      padding-left: 20px;
      color: #856404;
      font-size: 14px;
      line-height: 1.8;
    }

        .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    /* Departure Selection Styles */
    .loading-departures, .no-departures {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .spinner-small {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    .departure-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .departure-card {
      border: 2px solid #e0e0e0;
      border-radius: 15px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
      position: relative;
    }

    .departure-card:hover {
      border-color: #667eea;
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
    }

    .departure-card.selected {
      border-color: #667eea;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .departure-card.full {
      opacity: 0.6;
      cursor: not-allowed;
      background: #f5f5f5;
    }

    .departure-card.full:hover {
      transform: none;
      border-color: #e0e0e0;
    }

    .departure-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0f0f0;
    }

    .departure-number {
      font-weight: 700;
      font-size: 18px;
      color: #667eea;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.available {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.low {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.full {
      background: #f8d7da;
      color: #721c24;
    }

    .departure-body {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .departure-info {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .info-row {
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }

    .info-icon {
      font-size: 18px;
      min-width: 24px;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .info-label {
      font-size: 12px;
      color: #888;
      font-weight: 500;
    }

    .info-value {
      font-size: 14px;
      color: #333;
      font-weight: 600;
    }

    .departure-pricing {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      padding: 12px;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .price-row, .availability-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .price-label, .availability-label {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
    }

    .price-value {
      font-size: 16px;
      color: #667eea;
      font-weight: 700;
    }

    .availability-value {
      font-size: 14px;
      color: #333;
      font-weight: 600;
    }

    .departure-footer {
      margin-top: 10px;
      padding-top: 12px;
      border-top: 2px solid #667eea;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #667eea;
      font-weight: 600;
    }

    .check-icon {
      font-size: 20px;
    }

    .selected-departure-info {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 15px;
      border-left: 4px solid #667eea;
    }

    .no-departure-warning {
      background: #fff3cd;
      padding: 15px;
      border-radius: 10px;
      border-left: 4px solid #ffc107;
      text-align: center;
      margin-bottom: 15px;
    }

    .no-departure-warning .warning-icon {
      font-size: 32px;
      margin-bottom: 8px;
      display: block;
    }

    .no-departure-warning p {
      margin: 0;
      color: #856404;
      font-weight: 600;
    }
  `]
})
export class TourBookingComponent implements OnInit {
  tour: Tour | null = null;
  currentUser: KhachHang | null = null;
  departures: TourDeparture[] = [];
  selectedDeparture: TourDeparture | null = null;
  booking: TourBooking = {
    idTour: 0,
    idKhachHang: 0,
    soLuong: 1
  };
  
  loading = true;
  loadingDepartures = false;
  error: string | null = null;
  submitting = false;
  quantityError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tourService: TourService,
    private bookingService: TourBookingService,
    private tourDepartureService: TourDepartureService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Get tour ID from route
    const idTour = this.route.snapshot.paramMap.get('id');
    if (idTour) {
      this.booking.idTour = parseInt(idTour);
      this.loadTour();
    } else {
      this.error = 'Không tìm thấy thông tin tour';
      this.loading = false;
    }

    // Get current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        // Handle both new and old field names
        this.booking.idKhachHang = user.userID || user.idKhachHang || 0;
      }
    });
  }

  loadTour(): void {
    this.loading = true;
    this.error = null;

    this.tourService.getAll().subscribe({
      next: (tours: Tour[]) => {
        this.tour = tours.find((t: Tour) => {
          const tourId = t.tourID || t.idTour;
          return tourId === this.booking.idTour;
        }) || null;
        
        if (!this.tour) {
          this.error = 'Không tìm thấy tour';
          this.loading = false;
        } else {
          // Load departures for this tour
          this.loadDepartures();
        }
      },
      error: (err: any) => {
        this.error = 'Không thể tải thông tin tour';
        this.loading = false;
      }
    });
  }

  loadDepartures(): void {
    this.loadingDepartures = true;
    
    this.tourDepartureService.getUpcomingDeparturesByTour(this.booking.idTour).subscribe({
      next: (departures: TourDeparture[]) => {
        this.departures = departures;
        this.loading = false;
        this.loadingDepartures = false;
        
        // Auto-select first departure if available
        if (this.departures.length > 0) {
          this.selectDeparture(this.departures[0]);
        }
      },
      error: (err: any) => {
        this.toastService.warning('Không thể tải lịch khởi hành');
        this.loading = false;
        this.loadingDepartures = false;
      }
    });
  }

  selectDeparture(departure: TourDeparture): void {
    this.selectedDeparture = departure;
    this.booking.tourDepartureID = departure.tourDepartureID;
    // Reset quantity validation when changing departure
    this.validateQuantity();
  }

  onSubmit(): void {
    if (!this.currentUser) {
      this.toastService.warning('Vui lòng đăng nhập để đăng ký tour');
      this.navigateToLogin();
      return;
    }

    if (!this.selectedDeparture) {
      this.toastService.error('Vui lòng chọn lịch khởi hành');
      return;
    }

    if (!this.validateQuantity()) {
      return;
    }

    if (this.isDepartureFull()) {
      this.toastService.error('Lịch khởi hành này đã đầy. Vui lòng chọn lịch khác');
      return;
    }

    this.submitting = true;

    this.bookingService.bookTour(this.booking).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.success) {
          this.toastService.success('Đăng ký tour thành công!');
          setTimeout(() => {
            this.router.navigate(['/tours']);
          }, 2000);
        } else {
          this.toastService.error(response.message || 'Đăng ký thất bại');
        }
      },
      error: (err) => {
        this.submitting = false;
        const errorMsg = err.error?.message || 'Đăng ký thất bại. Vui lòng thử lại';
        this.toastService.error(errorMsg);
      }
    });
  }

  validateQuantity(): boolean {
    this.quantityError = null;

    if (this.booking.soLuong < 1) {
      this.quantityError = 'Số lượng phải lớn hơn 0';
      this.booking.soLuong = 1;
      return false;
    }

    if (this.booking.soLuong > 10) {
      this.quantityError = 'Mỗi lần đăng ký tối đa 10 người';
      this.booking.soLuong = 10;
      return false;
    }

    const available = this.getAvailableSeats();
    if (this.booking.soLuong > available) {
      this.quantityError = `Chỉ còn ${available} chỗ trống`;
      this.booking.soLuong = available;
      return false;
    }

    return true;
  }

  increaseQuantity(): void {
    if (this.booking.soLuong < 10 && this.booking.soLuong < this.getAvailableSeats()) {
      this.booking.soLuong++;
      this.validateQuantity();
    }
  }

  decreaseQuantity(): void {
    if (this.booking.soLuong > 1) {
      this.booking.soLuong--;
      this.validateQuantity();
    }
  }

  getTotalPrice(): number {
    if (!this.selectedDeparture) return 0;
    const pricePerPerson = this.hasActivePromotion() ? this.calculateDiscountedPrice() : this.selectedDeparture.originalPrice;
    return pricePerPerson * this.booking.soLuong;
  }

  getAvailableSeats(): number {
    if (!this.selectedDeparture) return 0;
    return this.selectedDeparture.availableSlots !== undefined ? this.selectedDeparture.availableSlots : this.selectedDeparture.maxQuantity;
  }

  isDepartureFull(): boolean {
    return this.getAvailableSeats() <= 0;
  }

  isTourFull(): boolean {
    if (!this.tour) return false;
    return this.tour.soChoConLai !== undefined && this.tour.soChoConLai <= 0;
  }

  isLowAvailability(): boolean {
    return this.getAvailableSeats() <= 10 && this.getAvailableSeats() > 0;
  }

  getTourStatusBadge(): string {
    if (this.isDepartureFull()) return 'ĐÃ ĐẦY';
    if (this.isLowAvailability()) return 'SẮP ĐẦY';
    return 'CÒN CHỖ';
  }

  // Promotion-related methods
  hasActivePromotion(): boolean {
    return !!this.selectedDeparture?.promotion && this.isPromotionActive(this.selectedDeparture.promotion);
  }

  isPromotionActive(promotion: any): boolean {
    if (!promotion) return false;
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    return now >= start && now <= end;
  }

  getPromotionPercent(): number {
    return this.selectedDeparture?.promotion?.percent || 0;
  }

  calculateDiscountedPrice(): number {
    if (!this.selectedDeparture || !this.hasActivePromotion()) {
      return this.selectedDeparture?.originalPrice || 0;
    }
    const discount = this.selectedDeparture.originalPrice * (this.getPromotionPercent() / 100);
    return this.selectedDeparture.originalPrice - discount;
  }

  getDiscountAmount(): number {
    if (!this.selectedDeparture || !this.hasActivePromotion()) {
      return 0;
    }
    return this.selectedDeparture.originalPrice * (this.getPromotionPercent() / 100);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Chưa xác định';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'Chưa xác định';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(dateString: string | undefined): string {
    if (!dateString) return 'Chưa xác định';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDuration(): string {
    if (this.selectedDeparture) {
      return `${this.selectedDeparture.dayNum} ngày ${this.selectedDeparture.dayNum - 1} đêm`;
    }
    if (!this.tour?.ngayKhoiHanh || !this.tour?.ngayKetThuc) {
      return 'Chưa xác định';
    }
    const start = new Date(this.tour.ngayKhoiHanh);
    const end = new Date(this.tour.ngayKetThuc);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} ngày ${days - 1} đêm`;
  }

  getTourName(): string {
    return this.tour?.tourName || this.tour?.tenTour || 'Tour';
  }

  getTourDestination(): string {
    return this.tour?.touristDestination || this.tour?.diaDiemTapTrung || 'N/A';
  }

  getTourImage(): string {
    if (this.tour?.hinhAnh) return this.tour.hinhAnh;
    const defaultImages = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57'
    ];
    const tourId = this.tour?.idTour || this.tour?.tourID || 0;
    const index = tourId % defaultImages.length;
    return `${defaultImages[index]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`;
  }

  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  }

  goBack(): void {
    this.router.navigate(['/tours']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: `/tours/${this.booking.idTour}/book` } 
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
