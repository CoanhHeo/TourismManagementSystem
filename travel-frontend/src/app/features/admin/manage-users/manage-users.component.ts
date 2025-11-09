import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../../app/shared/services/toast.service';

interface User {
  customerID: number;
  userID?: number;         // New field
  fullname?: string;       // New field
  tenKhachHang?: string;   // @deprecated - for backward compatibility
  email: string;
  phoneNumber?: string;    // New field
  dienThoai?: string;      // @deprecated - for backward compatibility
  address?: string;        // New field
  diaChi?: string;         // @deprecated - for backward compatibility
  dateOfBirth?: string;    // New field
  ngaySinh?: string;       // @deprecated - for backward compatibility
  role?: string;
  status?: boolean;        // New field
  trangThai?: boolean;     // @deprecated - for backward compatibility
  dateCreated?: string;    // New field
  ngayTao?: string;        // @deprecated - for backward compatibility
}

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="manage-users-wrapper">
      <div class="manage-users-container">
        <!-- Header -->
        <div class="page-header">
          <div class="header-left">
            <button class="back-btn" (click)="goBack()">
              <i class="icon">←</i>
              <span>Quay lại</span>
            </button>
            <h1 class="page-title">
              <i class="icon">👥</i>
              Quản lý Users
            </h1>
          </div>
          <button class="add-user-btn" (click)="openAddUserModal()">
            <i class="icon">➕</i>
            <span>Thêm User</span>
          </button>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card total">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-value">{{ users.length }}</div>
              <div class="stat-label">Tổng số users</div>
            </div>
          </div>
          <div class="stat-card active">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <div class="stat-value">{{ getActiveCount() }}</div>
              <div class="stat-label">Đang hoạt động</div>
            </div>
          </div>
          <div class="stat-card inactive">
            <div class="stat-icon">🔒</div>
            <div class="stat-info">
              <div class="stat-value">{{ getInactiveCount() }}</div>
              <div class="stat-label">Đã bị khóa</div>
            </div>
          </div>
          <div class="stat-card admin">
            <div class="stat-icon">👑</div>
            <div class="stat-info">
              <div class="stat-value">{{ getRoleCount('admin') }}</div>
              <div class="stat-label">Quản trị viên</div>
            </div>
          </div>
          <div class="stat-card guide">
            <div class="stat-icon">🎯</div>
            <div class="stat-info">
              <div class="stat-value">{{ getRoleCount('guide') }}</div>
              <div class="stat-label">Hướng dẫn viên</div>
            </div>
          </div>
          <div class="stat-card customer">
            <div class="stat-icon">🧳</div>
            <div class="stat-info">
              <div class="stat-value">{{ getRoleCount('customer') }}</div>
              <div class="stat-label">Khách hàng</div>
            </div>
          </div>
        </div>

        <!-- Filter Card -->
        <div class="filter-card">
          <div class="filter-group">
            <label>
              <i class="icon">🎯</i>
              Lọc theo Role
            </label>
            <select class="form-select" [(ngModel)]="selectedRoleFilter" (change)="applyFilter()">
              <option value="">-- Tất cả roles --</option>
              <option value="admin">Admin</option>
              <option value="guide">Hướng dẫn viên</option>
              <option value="customer">Khách hàng</option>
            </select>
          </div>

          <div class="filter-group">
            <label>
              <i class="icon">📊</i>
              Lọc theo Trạng thái
            </label>
            <select class="form-select" [(ngModel)]="selectedStatusFilter" (change)="applyFilter()">
              <option value="">-- Tất cả trạng thái --</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Đã khóa</option>
            </select>
          </div>

          <div class="filter-group">
            <div class="search-box">
              <i class="icon">🔍</i>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                [(ngModel)]="searchTerm"
                (input)="applyFilter()"
              >
            </div>
          </div>

          <button class="refresh-btn" (click)="loadUsers()" [disabled]="loading">
            <i class="icon" [class.spinning]="loading">🔄</i>
            <span>Làm mới</span>
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Đang tải danh sách users...</p>
        </div>

        <!-- Users Table -->
        <div *ngIf="!loading" class="table-card">
          <div class="table-header">
            <h2>Danh sách Users ({{ filteredUsers.length }})</h2>
          </div>
          
          <div class="table-responsive">
            <table class="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Role</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of filteredUsers" class="user-row">
                  <td class="user-id">{{ user.customerID }}</td>
                  <td class="user-name">
                    <strong>{{ user.fullname || user.tenKhachHang }}</strong>
                  </td>
                  <td class="email">
                    <a [href]="'mailto:' + user.email">{{ user.email }}</a>
                  </td>
                  <td class="phone">
                    <a [href]="'tel:' + user.dienThoai">{{ user.dienThoai }}</a>
                  </td>
                  <td class="address">
                    {{ user.diaChi || 'N/A' }}
                  </td>
                  <td class="role">
                    <span 
                      class="role-badge"
                      [class.admin]="normalizeRole(user.role) === 'admin'"
                      [class.guide]="normalizeRole(user.role) === 'guide'"
                      [class.customer]="normalizeRole(user.role) === 'customer'"
                    >
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </td>
                  <td class="status">
                    <span 
                      class="status-badge"
                      [class.active]="user.trangThai"
                      [class.inactive]="!user.trangThai"
                    >
                      {{ user.trangThai ? '✅ Hoạt động' : '⛔ Đã khóa' }}
                    </span>
                  </td>
                  <td class="date-created">
                    {{ formatDate(user.ngayTao) }}
                  </td>
                  <td class="actions">
                    <button 
                      class="btn-toggle" 
                      (click)="confirmToggleStatus(user)"
                      [title]="user.trangThai ? 'Khóa tài khoản' : 'Mở khóa tài khoản'"
                    >
                      <i class="icon">{{ user.trangThai ? '🔒' : '🔓' }}</i>
                      {{ user.trangThai ? 'Khóa' : 'Mở khóa' }}
                    </button>
                    <button 
                      class="btn-delete" 
                      (click)="confirmDelete(user)"
                      title="Xóa user"
                      [disabled]="user.role === 'admin'"
                    >
                      <i class="icon">🗑️</i>
                      Xóa
                    </button>
                  </td>
                </tr>
                <tr *ngIf="filteredUsers.length === 0" class="empty-row">
                  <td colspan="9" class="empty-message">
                    <i class="icon">📭</i>
                    <p>Không tìm thấy user nào</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Toggle Status Confirmation Modal -->
        <div *ngIf="showToggleModal" class="modal-overlay" (click)="closeToggleModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>
                <i class="icon">⚠️</i>
                Xác nhận {{ userToToggle?.trangThai ? 'khóa' : 'mở khóa' }} tài khoản
              </h3>
              <button class="close-btn" (click)="closeToggleModal()">×</button>
            </div>
            <div class="modal-body" *ngIf="userToToggle">
              <p>
                Bạn có chắc chắn muốn {{ userToToggle.trangThai ? 'khóa' : 'mở khóa' }} tài khoản này?
              </p>
              <div class="user-info">
                <strong>{{ userToToggle.fullname || userToToggle.tenKhachHang }}</strong>
                <p>Email: {{ userToToggle.email }}</p>
              </div>
              <p class="warning" *ngIf="userToToggle.trangThai">
                ⚠️ User sẽ không thể đăng nhập sau khi bị khóa!
              </p>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" (click)="closeToggleModal()">
                Hủy
              </button>
              <button 
                class="btn-confirm" 
                (click)="toggleUserStatus()"
                [disabled]="submitting"
              >
                <span *ngIf="!submitting">Xác nhận</span>
                <span *ngIf="submitting" class="btn-loading">
                  <div class="spinner-small"></div>
                  Đang xử lý...
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div *ngIf="showDeleteModal" class="modal-overlay" (click)="closeDeleteModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>
                <i class="icon">⚠️</i>
                Xác nhận xóa
              </h3>
              <button class="close-btn" (click)="closeDeleteModal()">×</button>
            </div>
            <div class="modal-body" *ngIf="userToDelete">
              <p>Bạn có chắc chắn muốn xóa user này?</p>
              <div class="user-info">
                <strong>{{ userToDelete.fullname || userToDelete.tenKhachHang }}</strong>
                <p>Email: {{ userToDelete.email }}</p>
              </div>
              <p class="warning">⚠️ Hành động này không thể hoàn tác!</p>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" (click)="closeDeleteModal()">
                Hủy
              </button>
              <button 
                class="btn-confirm-delete" 
                (click)="deleteUser()"
                [disabled]="deleting"
              >
                <span *ngIf="!deleting">Xóa</span>
                <span *ngIf="deleting" class="btn-loading">
                  <div class="spinner-small"></div>
                  Đang xóa...
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Add User Modal -->
        <div *ngIf="showAddModal" class="modal-overlay" (click)="closeAddModal()">
          <div class="modal-content modal-large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>
                <i class="icon">➕</i>
                Thêm User Mới
              </h3>
              <button class="close-btn" (click)="closeAddModal()">×</button>
            </div>
            <div class="modal-body">
              <form class="user-form">
                <div class="form-row">
                  <div class="form-group">
                    <label class="required">Họ tên</label>
                    <input
                      type="text"
                      class="form-input"
                      [(ngModel)]="newUser.fullname"
                      name="fullname"
                      placeholder="Nhập họ tên"
                      required
                    >
                  </div>
                  <div class="form-group">
                    <label class="required">Email</label>
                    <input
                      type="email"
                      class="form-input"
                      [(ngModel)]="newUser.email"
                      name="email"
                      placeholder="example@email.com"
                      required
                    >
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="required">Mật khẩu</label>
                    <input
                      type="password"
                      class="form-input"
                      [(ngModel)]="newUser.password"
                      name="password"
                      placeholder="Tối thiểu 6 ký tự"
                      required
                    >
                  </div>
                  <div class="form-group">
                    <label class="required">Role</label>
                    <select
                      class="form-input"
                      [(ngModel)]="newUser.roleId"
                      name="roleId"
                      required
                    >
                      <option value="">-- Chọn role --</option>
                      <option [value]="1">Admin</option>
                      <option [value]="2">Customer</option>
                      <option [value]="3">Guide</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      class="form-input"
                      [(ngModel)]="newUser.phoneNumber"
                      name="phoneNumber"
                      placeholder="0909xxxxxx"
                    >
                  </div>
                  <div class="form-group">
                    <label>Giới tính</label>
                    <select
                      class="form-input"
                      [(ngModel)]="newUser.gender"
                      name="gender"
                    >
                      <option value="">-- Chọn giới tính --</option>
                      <option value="Male">Nam</option>
                      <option value="Female">Nữ</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Tuổi</label>
                    <input
                      type="number"
                      class="form-input"
                      [(ngModel)]="newUser.age"
                      name="age"
                      placeholder="25"
                      min="1"
                      max="150"
                    >
                  </div>
                  <div class="form-group">
                    <label>Địa chỉ</label>
                    <input
                      type="text"
                      class="form-input"
                      [(ngModel)]="newUser.address"
                      name="address"
                      placeholder="Địa chỉ"
                    >
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" (click)="closeAddModal()">
                Hủy
              </button>
              <button 
                class="btn-confirm" 
                (click)="createUser()"
                [disabled]="creating || !isValidNewUser()"
              >
                <span *ngIf="!creating">Tạo User</span>
                <span *ngIf="creating" class="btn-loading">
                  <div class="spinner-small"></div>
                  Đang tạo...
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .manage-users-wrapper {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .manage-users-container {
      max-width: 1600px;
      margin: 0 auto;
    }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      width: fit-content;
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateX(-5px);
    }

    .page-title {
      color: white;
      font-size: 32px;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .add-user-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 24px;
      background: white;
      border: none;
      color: #667eea;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .add-user-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      background: linear-gradient(135deg, #ffffff 0%, #f0f0ff 100%);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }

    @media (max-width: 1400px) {
      .stats-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 900px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .stat-card {
      background: white;
      border-radius: 15px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      font-size: 40px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }

    .stat-card.total .stat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-card.admin .stat-icon {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    .stat-card.guide .stat-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-card.active .stat-icon {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .stat-card.inactive .stat-icon {
      background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
    }

    .stat-card.customer .stat-icon {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    }

    .stat-info {
      flex: 1;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #333;
      line-height: 1;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    /* Filter Card */
    .filter-card {
      background: white;
      border-radius: 20px;
      padding: 25px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-group label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-select {
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 14px;
      transition: all 0.3s ease;
      background: white;
      cursor: pointer;
    }

    .form-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .search-box:focus-within {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .search-box input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 14px;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .refresh-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }

    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Loading State */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    /* Table */
    .table-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .table-header {
      padding: 25px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .table-header h2 {
      margin: 0;
      font-size: 24px;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .users-table thead {
      background: #f8f9fa;
    }

    .users-table th {
      padding: 16px 20px;
      text-align: left;
      font-weight: 700;
      color: #333;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e0e0e0;
    }

    .users-table td {
      padding: 20px 20px;
      border-bottom: 1px solid #f0f0f0;
      color: #555;
    }

    .user-row:hover {
      background: #f8f9ff;
    }

    .user-id {
      font-weight: 700;
      color: #667eea;
      font-size: 16px;
    }

    .user-name strong {
      color: #333;
      font-size: 14px;
    }

    .email a, .phone a {
      color: #667eea;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .email a:hover, .phone a:hover {
      text-decoration: underline;
    }

    .address {
      max-width: 200px;
      color: #666;
    }

    .date-created {
      color: #666;
      white-space: nowrap;
      font-size: 13px;
    }

    .role-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
    }

    .role-badge.admin {
      background: rgba(250, 112, 154, 0.1);
      color: #fa709a;
    }

    .role-badge.guide {
      background: rgba(79, 172, 254, 0.1);
      color: #4facfe;
    }

    .role-badge.customer {
      background: rgba(67, 233, 123, 0.1);
      color: #43e97b;
    }

    .status-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
    }

    .status-badge.active {
      background: rgba(67, 233, 123, 0.1);
      color: #43e97b;
    }

    .status-badge.inactive {
      background: rgba(245, 87, 108, 0.1);
      color: #f5576c;
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    .btn-toggle, .btn-delete {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.3s ease;
    }

    .btn-toggle {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .btn-toggle:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
    }

    .btn-delete {
      background: rgba(245, 87, 108, 0.1);
      color: #f5576c;
    }

    .btn-delete:hover:not(:disabled) {
      background: #f5576c;
      color: white;
      transform: translateY(-2px);
    }

    .btn-delete:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .empty-row {
      text-align: center;
    }

    .empty-message {
      padding: 60px 20px !important;
      color: #999;
    }

    .empty-message .icon {
      font-size: 60px;
      margin-bottom: 15px;
      display: block;
    }

    .empty-message p {
      margin: 0;
      font-size: 16px;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(5px);
    }

    .modal-content {
      background: white;
      border-radius: 20px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: modalSlideIn 0.3s ease-out;
    }

    .modal-content.modal-large {
      max-width: 700px;
    }

    @keyframes modalSlideIn {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      padding: 25px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
      font-size: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 28px;
      color: #999;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #333;
    }

    .modal-body {
      padding: 25px;
    }

    .modal-body > p {
      margin: 0 0 15px 0;
      color: #666;
      font-size: 15px;
    }

    .user-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 10px;
      margin: 15px 0;
    }

    .user-info strong {
      color: #333;
      font-size: 16px;
      display: block;
      margin-bottom: 8px;
    }

    .user-info p {
      margin: 5px 0;
      color: #666;
      font-size: 14px;
    }

    .warning {
      color: #f57c00;
      font-weight: 600;
      margin-top: 15px !important;
    }

    .modal-footer {
      padding: 20px 25px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      gap: 15px;
      justify-content: flex-end;
    }

    .btn-cancel, .btn-confirm, .btn-confirm-delete {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .btn-cancel {
      background: #e0e0e0;
      color: #333;
    }

    .btn-cancel:hover {
      background: #d0d0d0;
    }

    .btn-confirm {
      background: #667eea;
      color: white;
      min-width: 120px;
    }

    .btn-confirm:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .btn-confirm-delete {
      background: #d32f2f;
      color: white;
      min-width: 100px;
    }

    .btn-confirm-delete:hover:not(:disabled) {
      background: #b71c1c;
      transform: translateY(-2px);
    }

    .btn-confirm:disabled,
    .btn-confirm-delete:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-loading {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: center;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .icon {
      font-size: 18px;
    }

    /* User Form */
    .user-form {
      padding: 0;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .form-group label.required::after {
      content: ' *';
      color: #f5576c;
    }

    .form-input {
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 14px;
      transition: all 0.3s ease;
      background: white;
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

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .filter-card {
        grid-template-columns: 1fr;
      }

      .table-responsive {
        overflow-x: scroll;
      }

      .users-table {
        min-width: 1200px;
      }

      .actions {
        flex-direction: column;
      }

      .btn-toggle, .btn-delete {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ManageUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  
  selectedRoleFilter: string = '';
  selectedStatusFilter: string = '';
  searchTerm: string = '';
  
  loading = false;
  showToggleModal = false;
  showDeleteModal = false;
  showAddModal = false;
  userToToggle: User | null = null;
  userToDelete: User | null = null;
  submitting = false;
  deleting = false;
  creating = false;

  newUser: any = {
    fullname: '',
    email: '',
    password: '',
    roleId: '',
    gender: '',
    phoneNumber: '',
    age: null,
    address: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    // Using the admin endpoint to get all users
    this.http.get<User[]>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.toastService.error('Không thể tải danh sách users');
        this.loading = false;
        this.users = [];
        this.filteredUsers = [];
      }
    });
  }

  applyFilter(): void {
    let filtered = [...this.users];

    // Filter by role
    if (this.selectedRoleFilter) {
      filtered = filtered.filter(u => this.normalizeRole(u.role) === this.selectedRoleFilter.toLowerCase());
    }

    // Filter by status
    if (this.selectedStatusFilter) {
      const isActive = this.selectedStatusFilter === 'active';
      filtered = filtered.filter(u => u.trangThai === isActive);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(u =>
        (u.fullname || u.tenKhachHang || '').toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.phoneNumber || u.dienThoai || '').includes(term)
      );
    }

    this.filteredUsers = filtered;
  }

  getActiveCount(): number {
    return this.users.filter(u => u.trangThai === true).length;
  }

  getInactiveCount(): number {
    return this.users.filter(u => u.trangThai === false).length;
  }

  getRoleCount(role: string): number {
    return this.users.filter(u => this.normalizeRole(u.role) === role.toLowerCase()).length;
  }

  normalizeRole(role?: string): string {
    if (!role) return '';
    const normalized = role.toLowerCase().trim();
    // Map "tour guide" to "guide"
    if (normalized === 'tour guide') return 'guide';
    return normalized;
  }

  getRoleLabel(role?: string): string {
    const normalized = this.normalizeRole(role);
    switch(normalized) {
      case 'admin': return '👑 Admin';
      case 'guide': return '🎯 Hướng dẫn viên';
      case 'customer': return '🧳 Khách hàng';
      default: return '👤 User';
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  confirmToggleStatus(user: User): void {
    this.userToToggle = user;
    this.showToggleModal = true;
  }

  closeToggleModal(): void {
    this.showToggleModal = false;
    this.userToToggle = null;
  }

  toggleUserStatus(): void {
    if (!this.userToToggle) return;

    this.submitting = true;
    const userId = this.userToToggle.customerID;
    const newStatus = !this.userToToggle.trangThai;

    this.http.put(`${environment.apiUrl}/admin/users/${userId}/status`, { trangThai: newStatus })
      .subscribe({
        next: () => {
          this.toastService.success(
            newStatus ? 'Đã mở khóa tài khoản thành công' : 'Đã khóa tài khoản thành công'
          );
          this.submitting = false;
          this.closeToggleModal();
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error toggling user status:', err);
          this.toastService.error('Không thể thay đổi trạng thái. Vui lòng thử lại');
          this.submitting = false;
        }
      });
  }

  confirmDelete(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  deleteUser(): void {
    if (!this.userToDelete) return;

    this.deleting = true;
    const userId = this.userToDelete.customerID;

    this.http.delete(`${environment.apiUrl}/admin/users/${userId}`).subscribe({
      next: () => {
        this.toastService.success('Xóa user thành công');
        this.deleting = false;
        this.closeDeleteModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        const errorMsg = err.error?.message || 'Không thể xóa user. Vui lòng thử lại';
        this.toastService.error(errorMsg);
        this.deleting = false;
      }
    });
  }

  openAddUserModal(): void {
    this.resetNewUser();
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetNewUser();
  }

  resetNewUser(): void {
    this.newUser = {
      fullname: '',
      email: '',
      password: '',
      roleId: '',
      gender: '',
      phoneNumber: '',
      age: null,
      address: ''
    };
  }

  isValidNewUser(): boolean {
    return !!(
      this.newUser.fullname?.trim() &&
      this.newUser.email?.trim() &&
      this.newUser.password?.length >= 6 &&
      this.newUser.roleId
    );
  }

  createUser(): void {
    if (!this.isValidNewUser()) {
      this.toastService.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    this.creating = true;

    this.http.post(`${environment.apiUrl}/admin/users`, this.newUser).subscribe({
      next: (response: any) => {
        this.toastService.success(response.message || 'Tạo user thành công');
        this.creating = false;
        this.closeAddModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error creating user:', err);
        const errorMsg = err.error?.message || 'Không thể tạo user. Vui lòng thử lại';
        this.toastService.error(errorMsg);
        this.creating = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
