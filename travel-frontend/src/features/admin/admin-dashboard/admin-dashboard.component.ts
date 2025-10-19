import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../app/core/services/api/auth.service';

interface DashboardStats {
  totalTours: number;
  totalCustomers: number;
  totalRevenue: number;
  totalBookings: number;
  pendingBookings: number;
  paidBookings: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-container">
      <!-- Header -->
      <header class="admin-header">
        <div class="header-content">
          <div class="brand">
            <i class="brand-icon">🏢</i>
            <h1>Admin Dashboard</h1>
          </div>
          <div class="user-info">
            <span class="welcome">Xin chào, {{ adminName }}</span>
            <button class="logout-btn" (click)="logout()">
              <i>🚪</i> Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <!-- Navigation Menu -->
      <nav class="admin-nav">
        <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
          <i>📊</i> Thống kê
        </a>
        <a routerLink="/admin/tours" routerLinkActive="active" class="nav-item">
          <i>🗺️</i> Quản lý Tours
        </a>
        <a routerLink="/admin/departures" routerLinkActive="active" class="nav-item">
          <i>🚀</i> Lịch khởi hành
        </a>
        <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
          <i>👥</i> Quản lý Users
        </a>
        <a routerLink="/tours" class="nav-item">
          <i>👁️</i> Xem trang khách
        </a>
      </nav>

      <!-- Statistics Cards -->
      <div class="stats-container">
        <div class="stat-card tours">
          <div class="stat-icon">🗺️</div>
          <div class="stat-content">
            <h3>Tổng số Tours</h3>
            <p class="stat-value">{{ stats.totalTours }}</p>
          </div>
        </div>

        <div class="stat-card customers">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>Tổng khách hàng</h3>
            <p class="stat-value">{{ stats.totalCustomers }}</p>
          </div>
        </div>

        <div class="stat-card revenue">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>Doanh thu</h3>
            <p class="stat-value">{{ formatRevenue(stats.totalRevenue) }}</p>
          </div>
        </div>

        <div class="stat-card bookings">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <h3>Tổng đặt tour</h3>
            <p class="stat-value">{{ stats.totalBookings }}</p>
            <p class="stat-detail">
              <span class="paid">{{ stats.paidBookings }} đã thanh toán</span>
              <span class="pending">{{ stats.pendingBookings }} chờ xử lý</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Thao tác nhanh</h2>
        <div class="actions-grid">
          <button class="action-btn" (click)="goToAddTour()">
            <i>➕</i>
            <span>Thêm Tour mới</span>
          </button>
          <button class="action-btn" (click)="goToAddDeparture()">
            <i>🚀</i>
            <span>Thêm lịch khởi hành</span>
          </button>
          <button class="action-btn" (click)="goToUsers()">
            <i>👥</i>
            <span>Quản lý Users</span>
          </button>
          <button class="action-btn" (click)="goToTours()">
            <i>📝</i>
            <span>Quản lý Tours</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      min-height: 100vh;
      background: #f5f7fa;
    }

    .admin-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .brand-icon {
      font-size: 2rem;
      font-style: normal;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .brand h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .welcome {
      font-size: 1rem;
      opacity: 0.9;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .logout-btn i {
      font-style: normal;
      font-size: 1.2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .logout-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-2px);
    }

    .admin-nav {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px 30px;
      display: flex;
      gap: 10px;
      background: white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: #f8f9fa;
      border: 2px solid transparent;
      border-radius: 8px;
      color: #333;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .nav-item i {
      font-style: normal;
      font-size: 1.2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }

    .nav-item:hover {
      background: #e9ecef;
      border-color: #667eea;
    }

    .nav-item.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .stats-container {
      max-width: 1400px;
      margin: 30px auto;
      padding: 0 30px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Tăng từ 280px lên 300px */
      gap: 25px;
    }

    .stat-card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.08);
      display: flex;
      gap: 20px;
      align-items: center;
      transition: all 0.3s ease;
      min-width: 0; /* Cho phép shrink */
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }

    .stat-icon {
      font-size: 3rem;
      font-style: normal;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 15px;
    }

    .stat-card.tours .stat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-card.customers .stat-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .stat-card.revenue .stat-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-card.bookings .stat-icon {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .stat-content {
      flex: 1;
      min-width: 0; /* Cho phép flex item shrink */
      overflow: hidden; /* Ẩn phần tràn */
    }

    .stat-content h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 0.95rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stat-value {
      margin: 0;
      font-size: 2.2rem;
      font-weight: 700;
      color: #333;
      word-break: break-word; /* Cho phép xuống dòng */
      line-height: 1.2;
    }

    /* Responsive font size cho số lớn */
    @media (max-width: 1200px) {
      .stat-value {
        font-size: 1.8rem;
      }
    }

    @media (max-width: 992px) {
      .stat-value {
        font-size: 1.5rem;
      }
    }

    .stat-detail {
      display: flex;
      gap: 15px;
      margin-top: 8px;
      font-size: 0.85rem;
    }

    .stat-detail .paid {
      color: #28a745;
      font-weight: 500;
    }

    .stat-detail .pending {
      color: #ffc107;
      font-weight: 500;
    }

    .quick-actions {
      max-width: 1400px;
      margin: 30px auto;
      padding: 0 30px;
      background: white;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    }

    .quick-actions h2 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 1.5rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 25px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .action-btn i {
      font-style: normal;
      font-size: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
    }

    .action-btn:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .admin-nav {
        flex-wrap: wrap;
      }

      .stats-container {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalTours: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    totalBookings: 0,
    pendingBookings: 0,
    paidBookings: 0
  };

  adminName = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get admin name
    const user = this.authService.getCurrentUser();
    this.adminName = user?.fullname || user?.tenKhachHang || 'Admin';

    // Load statistics
    this.loadStats();
  }

  loadStats(): void {
    this.http.get<DashboardStats>(`${environment.apiUrl}/admin/stats`)
      .subscribe({
        next: (data) => {
          this.stats = data;
        },
        error: (err) => {
          console.error('Error loading stats:', err);
        }
      });
  }

  formatRevenue(amount: number): string {
    if (amount >= 1000000000) {
      // Từ 1 tỷ trở lên: hiển thị dạng "1.5 tỷ"
      return (amount / 1000000000).toFixed(1) + ' tỷ VNĐ';
    } else if (amount >= 1000000) {
      // Từ 1 triệu trở lên: hiển thị dạng "500 tr"
      return (amount / 1000000).toFixed(0) + ' tr VNĐ';
    } else {
      // Dưới 1 triệu: format đầy đủ
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    }
  }

  goToAddTour(): void {
    this.router.navigate(['/admin/tours/add']);
  }

  goToAddDeparture(): void {
    this.router.navigate(['/admin/departures/add']);
  }

  goToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  goToTours(): void {
    this.router.navigate(['/admin/tours']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
