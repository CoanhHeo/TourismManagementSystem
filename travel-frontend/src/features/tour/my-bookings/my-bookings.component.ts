import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DangkyService } from '../../../app/core/services/api/dangky.service';
import { AuthService } from '../../../app/core/services/api/auth.service';
import { ToastService } from '../../../app/shared/services/toast.service';
import { TourBooking } from '../../../app/shared/models/interfaces';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="my-bookings-container">
      <!-- Header -->
      <div class="bookings-header">
        <button class="back-btn" (click)="goBack()">
          <i class="icon">←</i>
          Quay lại
        </button>
        <h1 class="page-title">
          <i class="icon">📋</i>
          Tour Đã Đăng Ký
        </h1>
        <div class="header-stats" *ngIf="!loading && bookings.length > 0">
          <span class="stat-item">
            <i class="icon">🎫</i>
            {{ bookings.length }} đăng ký
          </span>
          <span class="stat-item">
            <i class="icon">👥</i>
            {{ getTotalParticipants() }} người
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Đang tải danh sách đăng ký...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-container">
        <div class="error-content">
          <i class="error-icon">⚠️</i>
          <h3>Có lỗi xảy ra</h3>
          <p>{{ error }}</p>
          <button class="retry-btn" (click)="loadBookings()">Thử lại</button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && !error && bookings.length === 0" class="empty-container">
        <div class="empty-content">
          <i class="empty-icon">📭</i>
          <h3>Chưa có đăng ký nào</h3>
          <p>Bạn chưa đăng ký tour nào. Hãy khám phá các tour du lịch tuyệt vời!</p>
          <button class="browse-btn" (click)="browseTours()">
            <i class="icon">🌍</i>
            Khám phá tour
          </button>
        </div>
      </div>

      <!-- Bookings List -->
      <div *ngIf="!loading && !error && bookings.length > 0" class="bookings-list">
        <div *ngFor="let booking of bookings; trackBy: trackByBookingId" class="booking-card">
          <div class="booking-header">
            <div class="booking-id">
              <span class="label">Mã đăng ký:</span>
              <span class="value">#{{ booking.idDangKy }}</span>
            </div>
            <div class="booking-date">
              <i class="icon">📅</i>
              {{ formatDate(getBookingDate(booking)) }}
            </div>
          </div>

          <div class="booking-content">
            <div class="tour-info">
              <h3 class="tour-name">
                <i class="icon">🌍</i>
                {{ booking.tenTour }}
              </h3>
              
              <div class="tour-details">
                <div class="detail-row">
                  <div class="detail-item">
                    <i class="icon">📍</i>
                    <span class="label">Điểm tập trung:</span>
                    <span class="value">{{ booking.diaDiemTapTrung }}</span>
                  </div>
                </div>
                
                <div class="detail-row">
                  <div class="detail-item">
                    <i class="icon">🛫</i>
                    <span class="label">Khởi hành:</span>
                    <span class="value">{{ formatDate(booking.ngayKhoiHanh) }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="icon">🛬</i>
                    <span class="label">Kết thúc:</span>
                    <span class="value">{{ formatDate(booking.ngayKetThuc) }}</span>
                  </div>
                </div>
                
                <div class="detail-row">
                  <div class="detail-item">
                    <i class="icon">👥</i>
                    <span class="label">Số người:</span>
                    <span class="value highlight">{{ booking.soLuong }} người</span>
                  </div>
                  <div class="detail-item">
                    <i class="icon">💰</i>
                    <span class="label">Tổng tiền:</span>
                    <span class="value price">{{ formatPrice(booking.tongGia) }} ₫</span>
                  </div>
                </div>

                <div class="detail-row">
                  <div class="detail-item">
                    <i class="icon">💺</i>
                    <span class="label">Còn lại:</span>
                    <span class="value">{{ booking.soChoConLai }}/50 chỗ</span>
                  </div>
                  <div class="detail-item">
                    <i class="icon">🎯</i>
                    <span class="label">Trạng thái:</span>
                    <span class="status" [class.full]="booking.trangThai === 'FULL'">
                      {{ booking.trangThai === 'FULL' ? 'Đã đầy' : 'Còn chỗ' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="booking-actions">
              <button class="btn-secondary" (click)="viewTourDetails(booking)">
                <i class="icon">👁️</i>
                Xem tour
              </button>
              <button class="btn-primary" (click)="viewBookingDetails(booking)">
                <i class="icon">📄</i>
                Chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-bookings-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .bookings-header {
      background: white;
      border-radius: 15px;
      padding: 25px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .back-btn {
      background: #f0f0f0;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      transition: all 0.3s;
    }

    .back-btn:hover {
      background: #e0e0e0;
      transform: translateX(-5px);
    }

    .page-title {
      font-size: 32px;
      color: #333;
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-stats {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .stat-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #f8f9fa;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 500;
      color: #555;
    }

    .loading-container,
    .error-container,
    .empty-container {
      background: white;
      border-radius: 15px;
      padding: 60px 20px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-icon,
    .empty-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .error-content h3,
    .empty-content h3 {
      font-size: 24px;
      color: #333;
      margin: 0 0 10px 0;
    }

    .error-content p,
    .empty-content p {
      color: #666;
      margin: 0 0 20px 0;
    }

    .retry-btn,
    .browse-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s;
    }

    .retry-btn:hover,
    .browse-btn:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .bookings-list {
      display: grid;
      gap: 20px;
    }

    .booking-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      transition: all 0.3s;
    }

    .booking-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    .booking-header {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }

    .booking-id {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
    }

    .booking-id .label {
      opacity: 0.9;
    }

    .booking-id .value {
      background: rgba(255, 255, 255, 0.2);
      padding: 5px 15px;
      border-radius: 20px;
    }

    .booking-date {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      opacity: 0.95;
    }

    .booking-content {
      padding: 25px;
    }

    .tour-info {
      margin-bottom: 20px;
    }

    .tour-name {
      font-size: 24px;
      color: #333;
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .tour-details {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .detail-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .detail-item .icon {
      font-size: 18px;
    }

    .detail-item .label {
      color: #666;
      font-size: 14px;
      white-space: nowrap;
    }

    .detail-item .value {
      color: #333;
      font-weight: 500;
      margin-left: auto;
    }

    .detail-item .value.highlight {
      color: #667eea;
      font-weight: 600;
    }

    .detail-item .value.price {
      color: #28a745;
      font-weight: 600;
    }

    .status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      background: #28a745;
      color: white;
    }

    .status.full {
      background: #dc3545;
    }

    .booking-actions {
      display: flex;
      gap: 15px;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    .btn-secondary,
    .btn-primary {
      flex: 1;
      min-width: 150px;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s;
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #333;
      border: 2px solid #dee2e6;
    }

    .btn-secondary:hover {
      background: #e9ecef;
      border-color: #adb5bd;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .icon {
      display: inline-block;
    }

    @media (max-width: 768px) {
      .my-bookings-container {
        padding: 15px;
      }

      .page-title {
        font-size: 24px;
      }

      .bookings-header {
        padding: 20px;
      }

      .booking-header {
        padding: 15px;
      }

      .booking-content {
        padding: 20px;
      }

      .detail-row {
        grid-template-columns: 1fr;
      }

      .booking-actions {
        flex-direction: column;
      }

      .btn-secondary,
      .btn-primary {
        width: 100%;
      }
    }
  `]
})
export class MyBookingsComponent implements OnInit {
  bookings: TourBooking[] = [];
  loading = false;
  error = '';
  currentUser: any = null;

  constructor(
    private dangkyService: DangkyService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      const userId = user?.userID || user?.idKhachHang;
      if (user && userId) {
        this.loadBookings();
      } else {
        this.error = 'Vui lòng đăng nhập để xem danh sách đăng ký';
      }
    });
  }

  loadBookings(): void {
    const userId = this.currentUser?.userID || this.currentUser?.idKhachHang;
    if (!this.currentUser || !userId) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.dangkyService.getCustomerBookings(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.bookings = response.data;
        } else {
          this.error = 'Không thể tải danh sách đăng ký';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.error = err.error?.message || 'Có lỗi xảy ra khi tải danh sách đăng ký';
        this.loading = false;
        this.toastService.show(this.error, 'error');
      }
    });
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

  getBookingDate(booking: TourBooking): string | undefined {
    // Check new field first, fall back to old field
    return booking.dateCreated || booking.ngayDangKy;
  }

  formatPrice(price: number | undefined): string {
    if (!price) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
  }

  getTotalParticipants(): number {
    return this.bookings.reduce((sum, booking) => sum + (booking.soLuong || 0), 0);
  }

  trackByBookingId(index: number, booking: TourBooking): number {
    return booking.idDangKy || index;
  }

  viewTourDetails(booking: TourBooking): void {
    // Navigate to tour details page
    this.router.navigate(['/tours', booking.idTour]);
  }

  viewBookingDetails(booking: TourBooking): void {
    // Could navigate to a detailed booking page
    this.toastService.show(`Chi tiết đăng ký #${booking.idDangKy}`, 'info');
  }

  browseTours(): void {
    this.router.navigate(['/tours']);
  }

  goBack(): void {
    this.router.navigate(['/tours']);
  }
}
