import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../app/core/services/api/auth.service';

interface Passenger {
  bookingID: number;
  userID: number;
  userFullname: string;  // Đổi từ fullname -> userFullname để khớp với backend
  email: string;
  phoneNumber: string;
  quantity: number;
  originalPrice: number;
  discountAmount: number;
  totalPayment: number;
  paymentStatus: string;
  bookingDate: string;
}

interface PassengerResponse {
  passengers: Passenger[];
  totalCount: number;
  success: boolean;
}

interface TourDepartureInfo {
  tourDepartureID: number;
  tourName: string;
  touristDestination: string;
  departureLocation: string;
  departureTime: string;
  returnTime: string;
  dayNum: number;
  maxQuantity: number;
}

@Component({
  selector: 'app-passengers-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  template: `
    <div class="passengers-container">
      <!-- Header with Back Button -->
      <div class="header-section">
        <button (click)="goBack()" class="back-button">
          ← Quay lại Dashboard
        </button>
        <h1>👥 Danh Sách Hành Khách</h1>
      </div>

      <!-- Tour Info Card -->
      <div class="tour-info-card" *ngIf="tourInfo">
        <h2>🎯 {{ tourInfo.tourName }}</h2>
        <div class="tour-details">
          <div class="detail-row">
            <span class="icon">📍</span>
            <strong>Điểm đến:</strong> {{ tourInfo.touristDestination }}
          </div>
          <div class="detail-row">
            <span class="icon">🚌</span>
            <strong>Khởi hành từ:</strong> {{ tourInfo.departureLocation }}
          </div>
          <div class="detail-row">
            <span class="icon">📅</span>
            <strong>Thời gian:</strong> {{ formatDateTime(tourInfo.departureTime) }} → {{ formatDateTime(tourInfo.returnTime) }}
          </div>
          <div class="detail-row">
            <span class="icon">⏱️</span>
            <strong>Số ngày:</strong> {{ tourInfo.dayNum }} ngày
          </div>
          <div class="detail-row">
            <span class="icon">🎫</span>
            <strong>Sức chứa:</strong> {{ tourInfo.maxQuantity }} khách
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải danh sách hành khách...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-message">
        <h3>❌ {{ error }}</h3>
        <button (click)="loadPassengers()" class="retry-btn">🔄 Thử lại</button>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && !error && passengers.length === 0" class="empty-state">
        <div class="empty-icon">🚫</div>
        <h3>Chưa có hành khách đăng ký</h3>
        <p>Hiện tại chưa có khách hàng nào đã thanh toán và xác nhận tham gia chuyến du lịch này.</p>
      </div>

      <!-- Passengers Statistics -->
      <div class="stats-section" *ngIf="!loading && !error && passengers.length > 0">
        <div class="stat-card confirmed">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>{{ totalPassengers }}</h3>
            <p>Hành khách xác nhận</p>
          </div>
        </div>
        
        <div class="stat-card available">
          <div class="stat-icon">🎫</div>
          <div class="stat-content">
            <h3>{{ getAvailableSlots() }}</h3>
            <p>Chỗ còn trống</p>
          </div>
        </div>
      </div>

      <!-- Passengers List -->
      <div *ngIf="!loading && !error && passengers.length > 0" class="passengers-section">
        <h2>📋 Chi Tiết Hành Khách</h2>
        
        <div class="passengers-table-wrapper">
          <table class="passengers-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>👤 Thông tin khách hàng</th>
                <th>📞 Liên hệ</th>
                <th>🎫 Số lượng vé</th>
                <th>💰 Thông tin thanh toán</th>
                <th>📅 Ngày đặt</th>
                <th>✅ Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let passenger of passengers; let i = index" class="passenger-row">
                <td class="stt">{{ i + 1 }}</td>
                
                <td class="customer-info">
                  <div class="customer-name">{{ passenger.userFullname }}</div>
                </td>
                
                <td class="contact-info">
                  <div class="email">📧 {{ passenger.email }}</div>
                  <div class="phone" *ngIf="passenger.phoneNumber">📞 {{ passenger.phoneNumber }}</div>
                </td>
                
                <td class="quantity">
                  <div class="quantity-badge">{{ passenger.quantity }} người</div>
                </td>
                
                <td class="payment-info">
                  <div class="original-price">Giá gốc: {{ formatPrice(passenger.originalPrice * passenger.quantity) }}</div>
                  <div class="discount" *ngIf="passenger.discountAmount > 0">Giảm giá: -{{ formatPrice(passenger.discountAmount) }}</div>
                  <div class="total-payment">
                    <strong>Tổng: {{ formatPrice(passenger.totalPayment) }}</strong>
                  </div>
                </td>
                
                <td class="booking-date">{{ formatDate(passenger.bookingDate) }}</td>
                
                <td class="status">
                  <span class="status-badge" [class]="getStatusClass(passenger.paymentStatus)">
                    {{ getStatusText(passenger.paymentStatus) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Export/Print Actions -->
        <div class="actions-section">
          <button (click)="printPassengerList()" class="btn-secondary">
            🖨️ In danh sách
          </button>
          <button (click)="exportToExcel()" class="btn-secondary">
            📊 Xuất Excel
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./passengers-list.component.css']
})
export class PassengersListComponent implements OnInit {
  passengers: Passenger[] = [];
  totalPassengers = 0;
  tourInfo: TourDepartureInfo | null = null;
  loading = false;
  error: string | null = null;
  currentUser: any = null;
  departureId: number | null = null;

  private apiUrl = 'http://localhost:8080/api/tour-guide';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.route.params.subscribe(params => {
      this.departureId = Number(params['departureId']);
      if (this.departureId && this.currentUser) {
        this.loadPassengers();
        this.loadTourInfo();
      }
    });
  }

  loadPassengers(): void {
    if (!this.currentUser || !this.departureId) {
      this.error = 'Thông tin không hợp lệ';
      return;
    }

    this.loading = true;
    this.error = null;

    this.http.get<PassengerResponse>(`${this.apiUrl}/departure/${this.departureId}/passengers?userId=${this.currentUser.userID}`)
      .subscribe({
        next: (data) => {
          if (data.success) {
            this.passengers = data.passengers;
            this.totalPassengers = data.totalCount;
          } else {
            this.error = 'Không thể tải danh sách hành khách';
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading passengers:', err);
          this.error = err.error?.message || 'Không thể tải danh sách hành khách. Vui lòng thử lại.';
          this.loading = false;
        }
      });
  }

  loadTourInfo(): void {
    // This would ideally come from a separate API endpoint
    // For now, we'll get it from the departure info in the dashboard
    // In a real app, you'd have an endpoint like /api/tour-departures/{id}
  }

  goBack(): void {
    this.router.navigate(['/tour-guide/dashboard']);
  }

  getTotalRevenue(): number {
    return this.passengers.reduce((sum, passenger) => sum + passenger.totalPayment, 0);
  }

  getAvailableSlots(): number {
    if (!this.tourInfo) return 0;
    return this.tourInfo.maxQuantity - this.totalPassengers;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getStatusText(status: string): string {
    switch (status.toUpperCase()) {
      case 'PAID': return '✅ Đã thanh toán';
      case 'PENDING': return '⏳ Chờ thanh toán';
      case 'CANCELLED': return '❌ Đã hủy';
      default: return status;
    }
  }

  formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  printPassengerList(): void {
    window.print();
  }

  exportToExcel(): void {
    // Placeholder for Excel export functionality
    alert('Tính năng xuất Excel sẽ được triển khai sau!');
  }
}