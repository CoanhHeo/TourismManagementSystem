import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../app/core/services/api/auth.service';

interface TourDeparture {
  tourDepartureID: number;
  tourID: number;
  tourName: string;
  touristDestination: string;
  dayNum: number;
  departureLocation: string;
  departureTime: string;
  returnTime: string;
  maxQuantity: number;
  originalPrice: number;
  currentPassengers: number;
  availableSlots: number;
}

@Component({
  selector: 'app-tour-guide-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  template: `
    <div class="tour-guide-dashboard">
      <div class="header-section">
        <h1>🌟 Dashboard Hướng Dẫn Viên</h1>
        <p class="welcome-message">Chào mừng, {{ currentUser?.fullname }}! Đây là danh sách các lịch trình được phân công cho bạn.</p>
      </div>

      <div class="stats-section" *ngIf="departures.length > 0">
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <h3>{{ departures.length }}</h3>
            <p>Lịch trình đang hoạt động</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{ getTotalPassengers() }}</h3>
            <p>Tổng hành khách</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🚀</div>
          <div class="stat-content">
            <h3>{{ getUpcomingCount() }}</h3>
            <p>Chuyến sắp khởi hành</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-message">
        <h3>❌ {{ error }}</h3>
        <button (click)="loadDepartures()" class="retry-btn">🔄 Thử lại</button>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && !error && departures.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>Chưa có lịch trình nào được phân công</h3>
        <p>Hiện tại bạn chưa được phân công hướng dẫn lịch trình nào. Vui lòng liên hệ quản lý để biết thêm thông tin.</p>
      </div>

      <!-- Departures List -->
      <div *ngIf="!loading && !error && departures.length > 0" class="departures-section">
        <h2>📋 Danh Sách Lịch Trình</h2>
        
        <div class="departures-grid">
          <div 
            *ngFor="let departure of departures" 
            class="departure-card"
            [class.upcoming]="isUpcoming(departure)"
            [class.ongoing]="isOngoing(departure)"
          >
            <div class="card-header">
              <h3>{{ departure.tourName }}</h3>
              <div class="status-badge" 
                   [class.upcoming]="isUpcoming(departure)"
                   [class.ongoing]="isOngoing(departure)">
                {{ getStatusText(departure) }}
              </div>
            </div>

            <div class="card-content">
              <div class="info-row">
                <span class="icon">📍</span>
                <strong>Điểm đến:</strong> {{ departure.touristDestination }}
              </div>
              
              <div class="info-row">
                <span class="icon">🚌</span>
                <strong>Khởi hành:</strong> {{ departure.departureLocation }}
              </div>
              
              <div class="info-row">
                <span class="icon">📅</span>
                <strong>Ngày khởi hành:</strong> {{ formatDateTime(departure.departureTime) }}
              </div>
              
              <div class="info-row">
                <span class="icon">🏁</span>
                <strong>Ngày trở về:</strong> {{ formatDateTime(departure.returnTime) }}
              </div>
              
              <div class="info-row">
                <span class="icon">⏱️</span>
                <strong>Thời gian:</strong> {{ departure.dayNum }} ngày
              </div>
              
              <div class="info-row">
                <span class="icon">👥</span>
                <strong>Hành khách:</strong> 
                <span class="passengers-info">
                  {{ departure.currentPassengers }}/{{ departure.maxQuantity }}
                  <span class="available-slots">(còn {{ departure.availableSlots }} chỗ)</span>
                </span>
              </div>
              
              <div class="info-row">
                <span class="icon">💰</span>
                <strong>Giá tour:</strong> {{ formatPrice(departure.originalPrice) }}
              </div>
            </div>

            <div class="card-actions">
              <button 
                (click)="viewPassengers(departure)"
                class="btn-primary"
                [disabled]="departure.currentPassengers === 0">
                👥 Xem danh sách hành khách ({{ departure.currentPassengers }})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./tour-guide-dashboard.component.css']
})
export class TourGuideDashboardComponent implements OnInit {
  departures: TourDeparture[] = [];
  loading = false;
  error: string | null = null;
  currentUser: any = null;

  private apiUrl = 'http://localhost:8080/api/tour-guide';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadDepartures();
      }
    });
  }

  loadDepartures(): void {
    if (!this.currentUser) {
      this.error = 'Bạn cần đăng nhập để xem thông tin';
      return;
    }

    this.loading = true;
    this.error = null;

    this.http.get<TourDeparture[]>(`${this.apiUrl}/my-departures?userId=${this.currentUser.userID}`)
      .subscribe({
        next: (data) => {
          this.departures = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading departures:', err);
          this.error = err.error?.message || 'Không thể tải danh sách lịch trình. Vui lòng thử lại.';
          this.loading = false;
        }
      });
  }

  viewPassengers(departure: TourDeparture): void {
    if (departure.currentPassengers > 0) {
      this.router.navigate(['/tour-guide/passengers', departure.tourDepartureID]);
    }
  }

  isUpcoming(departure: TourDeparture): boolean {
    const now = new Date();
    const departureTime = new Date(departure.departureTime);
    return departureTime > now;
  }

  isOngoing(departure: TourDeparture): boolean {
    const now = new Date();
    const departureTime = new Date(departure.departureTime);
    const returnTime = new Date(departure.returnTime);
    return now >= departureTime && now <= returnTime;
  }

  getStatusText(departure: TourDeparture): string {
    if (this.isUpcoming(departure)) {
      return 'Sắp khởi hành';
    } else if (this.isOngoing(departure)) {
      return 'Đang diễn ra';
    }
    return 'Đã kết thúc';
  }

  getTotalPassengers(): number {
    return this.departures.reduce((sum, dep) => sum + dep.currentPassengers, 0);
  }

  getUpcomingCount(): number {
    return this.departures.filter(dep => this.isUpcoming(dep)).length;
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

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }
}