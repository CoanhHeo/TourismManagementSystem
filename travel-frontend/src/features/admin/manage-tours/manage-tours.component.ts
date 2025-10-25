import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../app/shared/services/toast.service';
import { TourService } from '../../../app/core/services/api/tour.service';
import { Tour } from '../../../app/shared/models/interfaces';

@Component({
  selector: 'app-manage-tours',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="manage-tours-wrapper">
      <div class="manage-tours-container">
        <!-- Header -->
        <div class="page-header">
          <div class="header-left">
            <button class="back-btn" (click)="goBack()">
              <i class="icon">←</i>
              <span>Quay lại</span>
            </button>
            <h1 class="page-title">
              <i class="icon">🗺️</i>
              Quản lý Tours
            </h1>
          </div>
          <button class="add-btn" (click)="goToAddTour()">
            <i class="icon">➕</i>
            <span>Thêm Tour mới</span>
          </button>
        </div>

        <!-- Search and Filter -->
        <div class="filter-card">
          <div class="search-box">
            <i class="icon">🔍</i>
            <input
              type="text"
              placeholder="Tìm kiếm tour theo tên hoặc điểm đến..."
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
            >
          </div>
          <button class="refresh-btn" (click)="loadTours()" [disabled]="loading">
            <i class="icon" [class.spinning]="loading">🔄</i>
            <span>Làm mới</span>
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Đang tải danh sách tour...</p>
        </div>

        <!-- Tours Table -->
        <div *ngIf="!loading" class="table-card">
          <div class="table-header">
            <h2>Danh sách Tours ({{ filteredTours.length }})</h2>
          </div>
          
          <div class="table-responsive">
            <table class="tours-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Tour</th>
                  <th>Điểm đến</th>
                  <th>Loại Tour</th>
                  <th>Khuyến mãi</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let tour of filteredTours" class="tour-row">
                  <td class="tour-id">{{ tour.tourID }}</td>
                  <td class="tour-name">
                    <div class="name-cell">
                      <strong>{{ tour.tourName }}</strong>
                      <small class="description">{{ truncateText(tour.description || '', 50) }}</small>
                    </div>
                  </td>
                  <td class="destination">
                    <i class="icon">📍</i>
                    {{ tour.touristDestination }}
                  </td>
                  <td class="tour-type">
                    <span class="type-badge">
                      {{ tour.tourType?.tourTypeName || 'N/A' }}
                    </span>
                  </td>
                  <td class="promotion">
                    <span *ngIf="tour.promotion" class="promotion-badge">
                      <i class="icon">🎁</i>
                      {{ tour.promotion.promotionName }} (-{{ tour.promotion.percent }}%)
                    </span>
                    <span *ngIf="!tour.promotion" class="no-promotion">Không có</span>
                  </td>
                  <td class="actions">
                    <button 
                      class="btn-edit" 
                      (click)="editTour(tour.tourID!)"
                      title="Chỉnh sửa tour"
                    >
                      <i class="icon">✏️</i>
                      Sửa
                    </button>
                    <button 
                      class="btn-delete" 
                      (click)="confirmDelete(tour)"
                      title="Xóa tour"
                    >
                      <i class="icon">🗑️</i>
                      Xóa
                    </button>
                  </td>
                </tr>
                <tr *ngIf="filteredTours.length === 0" class="empty-row">
                  <td colspan="6" class="empty-message">
                    <i class="icon">📭</i>
                    <p>Không tìm thấy tour nào</p>
                  </td>
                </tr>
              </tbody>
            </table>
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
            <div class="modal-body">
              <p>Bạn có chắc chắn muốn xóa tour này?</p>
              <div class="tour-info">
                <strong>{{ tourToDelete?.tourName }}</strong>
                <p>{{ tourToDelete?.touristDestination }}</p>
              </div>
              <p class="warning">⚠️ Hành động này không thể hoàn tác!</p>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" (click)="closeDeleteModal()">
                Hủy
              </button>
              <button 
                class="btn-confirm-delete" 
                (click)="deleteTour()"
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
      </div>
    </div>
  `,
  styles: [`
    .manage-tours-wrapper {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .manage-tours-container {
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

    .page-title {
      color: white;
      font-size: 32px;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .add-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .filter-card {
      background: white;
      border-radius: 15px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .search-box {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      background: #f8f9fa;
      transition: all 0.3s ease;
    }

    .search-box:focus-within {
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .search-box input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 15px;
      outline: none;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .refresh-btn:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .icon.spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-container {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .spinner {
      width: 50px;
      height: 50px;
      margin: 0 auto 20px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .table-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .table-header {
      padding: 20px 30px;
      border-bottom: 2px solid #f0f0f0;
    }

    .table-header h2 {
      margin: 0;
      color: #333;
      font-size: 22px;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .tours-table {
      width: 100%;
      border-collapse: collapse;
    }

    .tours-table thead {
      background: #f8f9fa;
    }

    .tours-table th {
      padding: 15px 20px;
      text-align: left;
      font-weight: 600;
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .tours-table td {
      padding: 20px;
      border-top: 1px solid #f0f0f0;
      vertical-align: middle;
    }

    .tour-row {
      transition: all 0.3s ease;
    }

    .tour-row:hover {
      background: #f8f9fa;
    }

    .tour-id {
      font-weight: 600;
      color: #667eea;
      font-size: 14px;
    }

    .name-cell {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .name-cell strong {
      color: #333;
      font-size: 15px;
    }

    .description {
      color: #999;
      font-size: 13px;
      line-height: 1.4;
    }

    .destination {
      white-space: nowrap;
    }

    .type-badge {
      display: inline-block;
      padding: 6px 12px;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }

    .price-value {
      color: #f44336;
      font-weight: 600;
      font-size: 15px;
    }

    .no-price, .no-promotion {
      color: #999;
      font-style: italic;
      font-size: 13px;
    }

    .promotion-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      background: #fff3e0;
      color: #f57c00;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }

    .actions {
      display: flex;
      gap: 10px;
      white-space: nowrap;
    }

    .btn-edit, .btn-delete {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .btn-edit {
      background: #e3f2fd;
      color: #1976d2;
    }

    .btn-edit:hover {
      background: #1976d2;
      color: white;
      transform: translateY(-2px);
    }

    .btn-delete {
      background: #ffebee;
      color: #d32f2f;
    }

    .btn-delete:hover {
      background: #d32f2f;
      color: white;
      transform: translateY(-2px);
    }

    .empty-row {
      height: 200px;
    }

    .empty-message {
      text-align: center;
      color: #999;
    }

    .empty-message i {
      font-size: 48px;
      display: block;
      margin-bottom: 15px;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 15px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
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
      padding: 20px 25px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #999;
      transition: color 0.3s ease;
      padding: 0;
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

    .tour-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 10px;
      margin: 15px 0;
    }

    .tour-info strong {
      color: #333;
      font-size: 16px;
      display: block;
      margin-bottom: 5px;
    }

    .tour-info p {
      margin: 0;
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

    .btn-cancel, .btn-confirm-delete {
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

    .btn-confirm-delete {
      background: #d32f2f;
      color: white;
      min-width: 100px;
    }

    .btn-confirm-delete:hover:not(:disabled) {
      background: #b71c1c;
      transform: translateY(-2px);
    }

    .btn-confirm-delete:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-loading {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .icon {
      font-size: 18px;
    }

    @media (max-width: 1200px) {
      .tours-table {
        font-size: 14px;
      }

      .tours-table th,
      .tours-table td {
        padding: 12px 15px;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .filter-card {
        flex-direction: column;
      }

      .refresh-btn {
        width: 100%;
        justify-content: center;
      }

      .table-responsive {
        overflow-x: scroll;
      }

      .tours-table {
        min-width: 900px;
      }

      .actions {
        flex-direction: column;
      }

      .btn-edit, .btn-delete {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ManageToursComponent implements OnInit {
  tours: any[] = []; // Using any to support promotion field from backend
  filteredTours: any[] = [];
  searchTerm: string = '';
  loading = false;
  showDeleteModal = false;
  tourToDelete: any = null;
  deleting = false;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private tourService: TourService
  ) {}

  ngOnInit(): void {
    this.loadTours();
  }

  /**
   * Tải danh sách tours từ TourService
   */
  loadTours(): void {
    this.loading = true;
    this.tourService.getTours().subscribe({
      next: (tours) => {
        this.tours = tours;
        this.filteredTours = tours;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tours:', err);
        this.toastService.error('Lỗi tải danh sách tours');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredTours = this.tours;
      return;
    }

    this.filteredTours = this.tours.filter(tour =>
      tour.tourName?.toLowerCase().includes(term) ||
      tour.touristDestination?.toLowerCase().includes(term) ||
      tour.description?.toLowerCase().includes(term)
    );
  }

  editTour(tourId: number): void {
    this.router.navigate(['/admin/tours/edit', tourId]);
  }

  confirmDelete(tour: Tour): void {
    this.tourToDelete = tour;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.tourToDelete = null;
  }

  /**
   * Xóa tour sử dụng TourService
   */
  deleteTour(): void {
    if (!this.tourToDelete) return;

    this.deleting = true;
    const tourId = this.tourToDelete.tourID;

    this.tourService.deleteTour(tourId).subscribe({
      next: () => {
        this.toastService.success('Xóa tour thành công');
        this.deleting = false;
        this.closeDeleteModal();
        this.loadTours();
      },
      error: (err) => {
        console.error('Error deleting tour:', err);
        const errorMsg = err.error?.message || 'Không thể xóa tour. Vui lòng thử lại';
        this.toastService.error(errorMsg);
        this.deleting = false;
      }
    });
  }

  goToAddTour(): void {
    this.router.navigate(['/admin/tours/add']);
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
