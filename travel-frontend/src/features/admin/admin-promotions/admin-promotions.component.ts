import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Promotion, PromotionService } from '../../../app/core/services/api/promotion.service';
import { ToastService } from '../../../app/shared/services/toast.service';
import { LoadingSpinnerComponent } from '../../../app/shared/components/loading-spinner.component';

/**
 * Admin component để quản lý khuyến mãi (Promotion Management)
 * 
 * Features:
 * - Hiển thị danh sách tất cả khuyến mãi
 * - Hiển thị thống kê (total, active, expired, upcoming)
 * - Thêm khuyến mãi mới (modal form)
 * - Chỉnh sửa khuyến mãi (modal form)
 * - Xóa khuyến mãi (confirmation dialog)
 * - Auto-refresh stats và list sau mỗi thao tác
 * 
 * UI Design:
 * - Gradient purple background matching manage-tours
 * - Glassmorphic back button
 * - Stats cards với color coding theo status
 * - Responsive table với status badges
 * - Modal overlay cho add/edit form
 * 
 * State Management:
 * - Angular Signals (promotions, stats, isLoading, showAddModal, etc.)
 * - Real-time updates sau CRUD operations
 * 
 * @standalone component
 */
@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="promotions-wrapper">
      <div class="promotions-container">
        <!-- Header -->
        <div class="page-header">
          <div class="header-left">
            <button class="back-btn" (click)="goBack()">
              <i class="icon">←</i>
              <span>Quay lại</span>
            </button>
            <h1 class="page-title">
              <i class="icon">🎁</i>
              Quản lý Khuyến mãi
            </h1>
          </div>
          <button class="add-btn" (click)="openAddModal()">
            <i class="icon">➕</i>
            <span>Thêm khuyến mãi mới</span>
          </button>
        </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>{{ stats().total }}</h3>
            <p>Tổng số</p>
          </div>
        </div>
        <div class="stat-card active">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>{{ stats().active }}</h3>
            <p>Đang hoạt động</p>
          </div>
        </div>
        <div class="stat-card upcoming">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <h3>{{ stats().upcoming }}</h3>
            <p>Sắp diễn ra</p>
          </div>
        </div>
        <div class="stat-card expired">
          <div class="stat-icon">🔴</div>
          <div class="stat-content">
            <h3>{{ stats().expired }}</h3>
            <p>Đã hết hạn</p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <app-loading-spinner *ngIf="isLoading()"></app-loading-spinner>

      <!-- Promotions Table -->
      <div class="table-container" *ngIf="!isLoading()">
        <table class="promotions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên khuyến mãi</th>
              <th>Giảm giá (%)</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let promo of promotions()" [class]="'row-' + getStatus(promo)">
              <td>{{ promo.promotionID }}</td>
              <td class="promo-name">{{ promo.promotionName }}</td>
              <td class="percent">{{ promo.percent }}%</td>
              <td>{{ formatDate(promo.startDate) }}</td>
              <td>{{ formatDate(promo.endDate) }}</td>
              <td>
                <span class="status-badge" [class]="'status-' + getStatus(promo)">
                  {{ getStatusText(promo) }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-edit" (click)="openEditModal(promo)" title="Chỉnh sửa">
                  ✏️
                </button>
                <button class="btn-delete" (click)="confirmDelete(promo)" title="Xóa">
                  🗑️
                </button>
              </td>
            </tr>
            <tr *ngIf="promotions().length === 0">
              <td colspan="7" class="no-data">Chưa có khuyến mãi nào</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal" *ngIf="showModal()" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditing() ? '✏️ Chỉnh sửa khuyến mãi' : '➕ Thêm khuyến mãi mới' }}</h2>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>
          
          <form (ngSubmit)="handleSubmit()" #promotionForm="ngForm">
            <div class="form-group">
              <label for="promotionName">Tên khuyến mãi *</label>
              <input
                type="text"
                id="promotionName"
                name="promotionName"
                [(ngModel)]="formData.promotionName"
                required
                minlength="3"
                maxlength="150"
                placeholder="VD: Giảm giá mùa hè"
                #promotionName="ngModel"
              />
              <div class="error" *ngIf="promotionName.invalid && promotionName.touched">
                <span *ngIf="promotionName.errors?.['required']">Tên khuyến mãi là bắt buộc</span>
                <span *ngIf="promotionName.errors?.['minlength']">Tên phải có ít nhất 3 ký tự</span>
              </div>
            </div>

            <div class="form-group">
              <label for="percent">Phần trăm giảm giá (%) *</label>
              <input
                type="number"
                id="percent"
                name="percent"
                [(ngModel)]="formData.percent"
                required
                min="1"
                max="100"
                step="0.01"
                placeholder="VD: 20"
                #percent="ngModel"
              />
              <div class="error" *ngIf="percent.invalid && percent.touched">
                <span *ngIf="percent.errors?.['required']">Phần trăm giảm giá là bắt buộc</span>
                <span *ngIf="percent.errors?.['min'] || percent.errors?.['max']">
                  Phần trăm phải từ 1 đến 100
                </span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="startDate">Ngày bắt đầu *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  [(ngModel)]="formData.startDate"
                  required
                  #startDate="ngModel"
                />
                <div class="error" *ngIf="startDate.invalid && startDate.touched">
                  Ngày bắt đầu là bắt buộc
                </div>
              </div>

              <div class="form-group">
                <label for="endDate">Ngày kết thúc *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  [(ngModel)]="formData.endDate"
                  required
                  #endDate="ngModel"
                />
                <div class="error" *ngIf="endDate.invalid && endDate.touched">
                  Ngày kết thúc là bắt buộc
                </div>
              </div>
            </div>

            <div class="error" *ngIf="dateError()">
              {{ dateError() }}
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="closeModal()">
                Hủy
              </button>
              <button 
                type="submit" 
                class="btn-submit" 
                [disabled]="promotionForm.invalid || isSaving()"
              >
                {{ isSaving() ? '⏳ Đang lưu...' : (isEditing() ? '💾 Cập nhật' : '➕ Thêm mới') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal" *ngIf="showDeleteConfirm()" (click)="closeDeleteConfirm()">
        <div class="modal-content small" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>⚠️ Xác nhận xóa</h2>
            <button class="close-btn" (click)="closeDeleteConfirm()">✕</button>
          </div>
          
          <p class="delete-message">
            Bạn có chắc chắn muốn xóa khuyến mãi 
            <strong>"{{ promotionToDelete()?.promotionName }}"</strong>?
          </p>
          <p class="delete-warning">
            ⚠️ Hành động này không thể hoàn tác!
          </p>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" (click)="closeDeleteConfirm()">
              Hủy
            </button>
            <button 
              type="button" 
              class="btn-delete-confirm" 
              (click)="handleDelete()"
              [disabled]="isDeleting()"
            >
              {{ isDeleting() ? '⏳ Đang xóa...' : '🗑️ Xóa' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .promotions-wrapper {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .promotions-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 10px;
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

    .back-btn .icon {
      font-size: 18px;
    }

    .page-title {
      color: white;
      font-size: 32px;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .page-title .icon {
      font-size: 36px;
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .add-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .add-btn .icon {
      font-size: 18px;
    }

    /* Stats Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #3498db;
    }

    .stat-card.active {
      border-left-color: #27ae60;
    }

    .stat-card.upcoming {
      border-left-color: #f39c12;
    }

    .stat-card.expired {
      border-left-color: #e74c3c;
    }

    .stat-icon {
      font-size: 36px;
    }

    .stat-content h3 {
      margin: 0;
      font-size: 32px;
      color: #2c3e50;
    }

    .stat-content p {
      margin: 5px 0 0 0;
      color: #7f8c8d;
      font-size: 14px;
    }

    /* Table */
    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .promotions-table {
      width: 100%;
      border-collapse: collapse;
    }

    .promotions-table thead {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .promotions-table th {
      padding: 16px;
      text-align: left;
      font-weight: 600;
    }

    .promotions-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #ecf0f1;
    }

    .promotions-table tbody tr {
      transition: background-color 0.2s ease;
    }

    .promotions-table tbody tr:hover {
      background-color: #f8f9fa;
    }

    .row-active {
      background-color: #d5f4e6;
    }

    .row-upcoming {
      background-color: #fff3cd;
    }

    .row-expired {
      background-color: #f8d7da;
    }

    .promo-name {
      font-weight: 600;
      color: #2c3e50;
    }

    .percent {
      font-weight: 700;
      color: #e74c3c;
      font-size: 18px;
    }

    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-active {
      background-color: #27ae60;
      color: white;
    }

    .status-upcoming {
      background-color: #f39c12;
      color: white;
    }

    .status-expired {
      background-color: #e74c3c;
      color: white;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .btn-edit, .btn-delete {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .btn-edit:hover {
      background-color: #3498db;
    }

    .btn-delete:hover {
      background-color: #e74c3c;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #95a5a6;
      font-style: italic;
    }

    /* Modal */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .modal-content.small {
      max-width: 400px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #ecf0f1;
    }

    .modal-header h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 22px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #95a5a6;
      line-height: 1;
      padding: 0;
      width: 32px;
      height: 32px;
    }

    .close-btn:hover {
      color: #e74c3c;
    }

    form {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #2c3e50;
      font-weight: 600;
      font-size: 14px;
    }

    input[type="text"],
    input[type="number"],
    input[type="date"] {
      width: 100%;
      padding: 12px;
      border: 2px solid #ecf0f1;
      border-radius: 8px;
      font-size: 15px;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    input.ng-invalid.ng-touched {
      border-color: #e74c3c;
    }

    .error {
      color: #e74c3c;
      font-size: 13px;
      margin-top: 6px;
      display: block;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;
    }

    .btn-cancel,
    .btn-submit,
    .btn-delete-confirm {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-cancel {
      background: #ecf0f1;
      color: #7f8c8d;
    }

    .btn-cancel:hover {
      background: #bdc3c7;
    }

    .btn-submit {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-delete-confirm {
      background: #e74c3c;
      color: white;
    }

    .btn-delete-confirm:hover:not(:disabled) {
      background: #c0392b;
    }

    .delete-message {
      padding: 20px 24px 10px;
      color: #2c3e50;
      font-size: 16px;
    }

    .delete-warning {
      padding: 0 24px 20px;
      color: #e74c3c;
      font-size: 14px;
      font-weight: 600;
    }

    /* General Styles */
    .icon {
      font-style: normal;
      font-size: 18px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .page-title {
        font-size: 24px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .table-container {
        overflow-x: auto;
      }

      .promotions-table {
        font-size: 14px;
      }

      .promotions-table th,
      .promotions-table td {
        padding: 10px 12px;
      }
    }
  `]
})
export class AdminPromotionsComponent implements OnInit {
  /** Signal chứa danh sách tất cả promotions */
  promotions = signal<Promotion[]>([]);
  
  /** Signal chứa thống kê (total, active, expired, upcoming) */
  stats = signal({ total: 0, active: 0, expired: 0, upcoming: 0 });
  
  /** Signal loading state cho fetch data */
  isLoading = signal(true);
  
  /** Signal saving state cho create/update operations */
  isSaving = signal(false);
  
  /** Signal deleting state cho delete operation */
  isDeleting = signal(false);
  
  /** Signal hiển thị modal add/edit */
  showModal = signal(false);
  
  /** Signal hiển thị delete confirmation dialog */
  showDeleteConfirm = signal(false);
  
  /** Signal check đang edit hay create mới */
  isEditing = signal(false);
  
  /** Signal error message cho date validation */
  dateError = signal('');
  
  /** Signal chứa promotion đang được chọn để xóa */
  promotionToDelete = signal<Promotion | null>(null);

  /** Form data cho add/edit modal */
  formData: Promotion = {
    promotionName: '',
    percent: 0,
    startDate: '',
    endDate: ''
  };

  constructor(
    private promotionService: PromotionService,
    private toastService: ToastService,
    private router: Router
  ) {}

  /**
   * Lifecycle hook - Load data khi component init
   * Gọi loadPromotions() và loadStats()
   */
  ngOnInit() {
    this.loadPromotions();
    this.loadStats();
  }

  /**
   * Navigate về admin dashboard
   */
  goBack() {
    this.router.navigate(['/admin']);
  }

  /**
   * Load tất cả promotions từ backend
   * Cập nhật promotions signal và tính toán stats local
   * Hiển thị loading spinner trong quá trình fetch
   */
  loadPromotions() {
    this.isLoading.set(true);
    this.promotionService.getAllPromotions().subscribe({
      next: (data) => {
        this.promotions.set(data);
        this.isLoading.set(false);
        this.calculateStats(data);
      },
      error: (error) => {
        console.error('Error loading promotions:', error);
        this.toastService.show('Không thể tải danh sách khuyến mãi', 'error');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Load thống kê từ backend API
   * Backup method nếu calculateStats() local không dùng
   */
  loadStats() {
    this.promotionService.getPromotionStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  /**
   * Tính toán thống kê local từ danh sách promotions
   * 
   * Logic phân loại:
   * - active: currentDate nằm trong [startDate, endDate]
   * - expired: currentDate > endDate
   * - upcoming: currentDate < startDate
   * 
   * @param promotions - Danh sách promotions cần tính stats
   */
  calculateStats(promotions: Promotion[]) {
    const stats = {
      total: promotions.length,
      active: 0,
      expired: 0,
      upcoming: 0
    };

    promotions.forEach(promo => {
      const status = this.getStatus(promo);
      if (status === 'active') stats.active++;
      else if (status === 'expired') stats.expired++;
      else if (status === 'upcoming') stats.upcoming++;
    });

    this.stats.set(stats);
  }

  getStatus(promotion: Promotion): 'active' | 'expired' | 'upcoming' {
    return this.promotionService.getPromotionStatus(promotion);
  }

  getStatusText(promotion: Promotion): string {
    const status = this.getStatus(promotion);
    switch (status) {
      case 'active': return 'Đang hoạt động';
      case 'expired': return 'Đã hết hạn';
      case 'upcoming': return 'Sắp diễn ra';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  /**
   * Mở modal để thêm promotion mới
   * Reset form data và error messages
   */
  openAddModal() {
    this.isEditing.set(false);
    this.formData = {
      promotionName: '',
      percent: 0,
      startDate: '',
      endDate: ''
    };
    this.dateError.set('');
    this.showModal.set(true);
  }

  /**
   * Mở modal để edit promotion
   * 
   * Convert dates sang format YYYY-MM-DD cho HTML date input
   * Dùng formatDateForInput() helper method
   * 
   * @param promotion - Promotion cần edit
   */
  openEditModal(promotion: Promotion) {
    this.isEditing.set(true);
    // Convert dates to YYYY-MM-DD format for date inputs
    this.formData = {
      ...promotion,
      startDate: this.formatDateForInput(promotion.startDate),
      endDate: this.formatDateForInput(promotion.endDate)
    };
    this.dateError.set('');
    this.showModal.set(true);
  }

  /**
   * Format date string to YYYY-MM-DD for HTML date input
   * 
   * HTML date input chỉ chấp nhận format YYYY-MM-DD
   * Backend có thể trả về nhiều format khác nhau
   * 
   * Logic:
   * 1. Nếu đã là YYYY-MM-DD → return as is
   * 2. Nếu không → parse Date object và format lại
   * 
   * @param dateString - Date string từ backend (bất kỳ format nào)
   * @returns Date string format YYYY-MM-DD cho HTML input
   */
  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    // If it's already YYYY-MM-DD, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Otherwise, parse and format
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  closeModal() {
    this.showModal.set(false);
  }

  validateDates(): boolean {
    if (!this.formData.startDate || !this.formData.endDate) {
      this.dateError.set('');
      return true;
    }

    const startDate = new Date(this.formData.startDate);
    const endDate = new Date(this.formData.endDate);

    if (endDate < startDate) {
      this.dateError.set('⚠️ Ngày kết thúc phải sau ngày bắt đầu');
      return false;
    }

    this.dateError.set('');
    return true;
  }

  handleSubmit() {
    if (!this.validateDates()) {
      return;
    }

    this.isSaving.set(true);

    // Ensure percent is a number
    const promotionData = {
      ...this.formData,
      percent: Number(this.formData.percent)
    };

    const operation = this.isEditing() && promotionData.promotionID
      ? this.promotionService.updatePromotion(promotionData.promotionID, promotionData)
      : this.promotionService.createPromotion(promotionData);

    operation.subscribe({
      next: () => {
        this.toastService.show(
          this.isEditing() ? 'Cập nhật khuyến mãi thành công!' : 'Thêm khuyến mãi mới thành công!',
          'success'
        );
        this.closeModal();
        this.loadPromotions();
        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('Error saving promotion:', error);
        // Show detailed error message from backend
        let errorMessage = 'Có lỗi xảy ra khi lưu khuyến mãi';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        this.toastService.show(errorMessage, 'error');
        this.isSaving.set(false);
      }
    });
  }

  confirmDelete(promotion: Promotion) {
    this.promotionToDelete.set(promotion);
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm.set(false);
    this.promotionToDelete.set(null);
  }

  handleDelete() {
    const promotion = this.promotionToDelete();
    if (!promotion || !promotion.promotionID) return;

    this.isDeleting.set(true);

    this.promotionService.deletePromotion(promotion.promotionID).subscribe({
      next: () => {
        this.toastService.show('Xóa khuyến mãi thành công!', 'success');
        this.closeDeleteConfirm();
        this.loadPromotions();
        this.isDeleting.set(false);
      },
      error: (error) => {
        console.error('Error deleting promotion:', error);
        this.toastService.show('Không thể xóa khuyến mãi. Có thể đang được sử dụng trong tours.', 'error');
        this.isDeleting.set(false);
      }
    });
  }
}
