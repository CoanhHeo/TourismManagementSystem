import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../app/core/services/api/auth.service';

interface MyBooking {
  bookingID: number;
  userFullname: string;
  tourName: string;
  tourDepartureID: number;
  departureTime: string;
  quantity: number;
  originalPrice: number;
  discountAmount: number;
  totalPayment: number;
  paymentStatus: string;
  bookingDate: string;
  guideFullname?: string;
  guideRating?: number;
  guideLanguages?: string;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  template: `
    <div class="my-tours-container">
      <div class="header-section">
        <button class="back-btn" (click)="goBack()">← Quay lại</button>
        <h1>📋 Tour Đã Đặt</h1>
        <p class="subtitle" *ngIf="!loading && bookings.length > 0">
          Bạn có {{ bookings.length }} tour đã đặt
        </p>
      </div>

      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Đang tải danh sách tour...</p>
      </div>

      <div *ngIf="error && !loading" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>Có lỗi xảy ra</h3>
        <p>{{ error }}</p>
        <button class="retry-btn" (click)="loadBookings()">🔄 Thử lại</button>
      </div>

      <div *ngIf="!loading && !error && bookings.length === 0" class="empty-container">
        <div class="empty-icon">📭</div>
        <h3>Chưa có tour nào</h3>
        <p>Bạn chưa đặt tour nào. Hãy khám phá các tour du lịch tuyệt vời!</p>
        <button class="browse-btn" (click)="browseTours()">🌍 Khám phá tour</button>
      </div>

      <div *ngIf="!loading && !error && bookings.length > 0" class="bookings-grid">
        <div *ngFor="let booking of bookings" class="booking-card">
          <div class="card-header">
            <div class="booking-id">#{{ booking.bookingID }}</div>
            <div class="payment-status" [class]="getStatusClass(booking.paymentStatus)">
              {{ getStatusText(booking.paymentStatus) }}
            </div>
          </div>

          <div class="card-body">
            <h3 class="tour-name">{{ booking.tourName }}</h3>
            
            <div class="booking-info">
              <div class="info-item">
                <span class="icon">📅</span>
                <div class="info-content">
                  <span class="label">Khởi hành</span>
                  <span class="value">{{ formatDateTime(booking.departureTime) }}</span>
                </div>
              </div>

              <div class="info-item">
                <span class="icon">👥</span>
                <div class="info-content">
                  <span class="label">Số người</span>
                  <span class="value">{{ booking.quantity }} người</span>
                </div>
              </div>

              <div class="info-item">
                <span class="icon">💰</span>
                <div class="info-content">
                  <span class="label">Giá gốc</span>
                  <span class="value">{{ formatPrice(booking.originalPrice * booking.quantity) }}</span>
                </div>
              </div>

              <div class="info-item" *ngIf="booking.discountAmount > 0">
                <span class="icon">🎁</span>
                <div class="info-content">
                  <span class="label">Giảm giá</span>
                  <span class="value discount">-{{ formatPrice(booking.discountAmount) }}</span>
                </div>
              </div>

              <div class="info-item total">
                <span class="icon">💵</span>
                <div class="info-content">
                  <span class="label">Tổng thanh toán</span>
                  <span class="value price">{{ formatPrice(booking.totalPayment) }}</span>
                </div>
              </div>

              <div class="info-item">
                <span class="icon">📆</span>
                <div class="info-content">
                  <span class="label">Ngày đặt</span>
                  <span class="value">{{ formatDateTime(booking.bookingDate) }}</span>
                </div>
              </div>

              <div class="info-item" *ngIf="booking.guideFullname">
                <span class="icon">👨‍✈️</span>
                <div class="info-content">
                  <span class="label">Hướng dẫn viên</span>
                  <span class="value guide-name">
                    {{ booking.guideFullname }}
                    <span class="guide-rating" *ngIf="booking.guideRating">
                      ⭐ {{ booking.guideRating }}
                    </span>
                  </span>
                </div>
              </div>

              <div class="info-item" *ngIf="booking.guideLanguages">
                <span class="icon">🗣️</span>
                <div class="info-content">
                  <span class="label">Ngôn ngữ</span>
                  <span class="value">{{ booking.guideLanguages }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-tours-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px 20px;
    }
    .header-section {
      max-width: 1200px;
      margin: 0 auto 30px;
      text-align: center;
      color: white;
    }
    .back-btn {
      position: absolute;
      left: 20px;
      top: 30px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s;
    }
    .back-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateX(-5px);
    }
    h1 {
      font-size: 2.5rem;
      margin: 0 0 10px 0;
      font-weight: 700;
    }
    .subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
      margin: 0;
    }
    .loading-container, .error-container, .empty-container {
      max-width: 500px;
      margin: 50px auto;
      padding: 50px;
      background: white;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    .spinner {
      width: 60px;
      height: 60px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .error-icon, .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
      display: inline-block;
      transform: rotate(0deg);
    }
    .retry-btn, .browse-btn {
      margin-top: 20px;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.3s;
    }
    .retry-btn:hover, .browse-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    .bookings-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 25px;
    }
    .booking-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
      transition: all 0.3s;
    }
    .booking-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    .card-header {
      background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #f0f0f0;
    }
    .booking-id {
      font-weight: 700;
      font-size: 1.1rem;
      color: #333;
    }
    .payment-status {
      padding: 6px 15px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .payment-status.paid {
      background: #d4edda;
      color: #155724;
    }
    .payment-status.pending {
      background: #fff3cd;
      color: #856404;
    }
    .payment-status.cancelled {
      background: #f8d7da;
      color: #721c24;
    }
    .card-body {
      padding: 25px;
    }
    .tour-name {
      font-size: 1.3rem;
      color: #333;
      margin: 0 0 20px 0;
      font-weight: 600;
      line-height: 1.4;
    }
    .booking-info {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 10px;
      transition: background 0.2s;
    }
    .info-item:hover {
      background: #e9ecef;
    }
    .info-item.total {
      background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
      border: 2px solid #ffc107;
    }
    .info-item .icon {
      font-size: 1.3rem;
      min-width: 25px;
      text-align: center;
      display: inline-block;
      transform: rotate(0deg);
    }
    .info-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .label {
      font-size: 0.85rem;
      color: #666;
      font-weight: 500;
    }
    .value {
      font-size: 1rem;
      color: #333;
      font-weight: 600;
    }
    .value.price {
      color: #28a745;
      font-size: 1.1rem;
    }
    .value.discount {
      color: #dc3545;
    }
    
    .guide-name {
      color: #667eea !important;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .guide-rating {
      font-size: 0.85rem;
      color: #ffa726;
      font-weight: 600;
      padding: 2px 8px;
      background: #fff3e0;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
    
    @media (max-width: 768px) {
      .my-tours-container {
        padding: 20px 15px;
      }
      .back-btn {
        position: static;
        margin-bottom: 20px;
        width: 100%;
      }
      h1 {
        font-size: 2rem;
      }
      .bookings-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }
  `]
})
export class MyBookingsComponent implements OnInit {
  bookings: MyBooking[] = [];
  loading = false;
  error = '';
  currentUser: any = null;
  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.userID) {
        this.loadBookings();
      } else {
        this.error = 'Vui lòng đăng nhập để xem danh sách tour đã đặt';
      }
    });
  }

  loadBookings(): void {
    if (!this.currentUser || !this.currentUser.userID) {
      this.error = 'Vui lòng đăng nhập để xem danh sách tour đã đặt';
      return;
    }
    this.loading = true;
    this.error = '';

    this.http.get<MyBooking[]>(`${this.apiUrl}/user/${this.currentUser.userID}`)
      .subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.bookings = data;
          } else {
            this.bookings = [];
            this.error = 'Dữ liệu trả về không đúng định dạng';
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading bookings:', err);
          this.error = 'Không thể tải danh sách tour. Vui lòng thử lại sau.';
          this.loading = false;
          this.bookings = [];
        }
      });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PAID': return 'paid';
      case 'PENDING': return 'pending';
      case 'CANCELLED': return 'cancelled';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PAID': return '✅ Đã thanh toán';
      case 'PENDING': return '⏳ Chờ thanh toán';
      case 'CANCELLED': return '❌ Đã hủy';
      default: return status;
    }
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return 'N/A';
    try {
      const date = new Date(dateTime);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  }

  formatPrice(price: number): string {
    if (price === null || price === undefined) return '0 ₫';
    try {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price);
    } catch (e) {
      console.error('Error formatting price:', e);
      return '0 ₫';
    }
  }

  browseTours(): void {
    this.router.navigate(['/tours']);
  }

  goBack(): void {
    this.router.navigate(['/tours']);
  }
}
