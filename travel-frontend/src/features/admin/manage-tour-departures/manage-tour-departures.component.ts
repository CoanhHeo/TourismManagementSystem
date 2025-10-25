import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../app/shared/services/toast.service';
import { TourService } from '../../../app/core/services/api/tour.service';
import { TourDepartureService } from '../../../app/core/services/api/tour-departure.service';

/**
 * Local interfaces for manage-tour-departures component
 * Note: Giữ local vì có structure đặc biệt để transform data từ API response
 */

// Simplified Tour interface (chỉ cần 3 fields cho component này)
interface Tour {
  tourID: number;
  tourName: string;
  touristDestination: string;
}

// API Response from backend (flat structure)
interface TourDepartureResponse {
  tourDepartureID: number;
  tourID: number;
  tourName: string;
  touristDestination: string;
  dayNum: number;
  originalPrice: number;
  departureLocation: string;
  departureTime: string;
  returnTime: string;
  maxQuantity: number;
  availableSlots: number;
  promotion?: any;
  tourGuide?: {
    tourGuideID: number;
    userID: number;
    fullname: string;
    email: string;
    rating?: number;
    languages?: string;
  };
}

// Frontend model (nested structure cho UI display)
interface TourDeparture {
  departureID: number;
  tour: Tour;
  dayNum: number;
  originalPrice: number;
  departureLocation: string;
  departureTime: string;
  returnTime: string;
  maxQuantity: number;
  currentBookings?: number;
  status?: 'upcoming' | 'ongoing' | 'completed';
  tourGuide?: {
    tourGuideID: number;
    fullname: string;
    rating?: number;
  };
}

@Component({
  selector: 'app-manage-tour-departures',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="manage-departures-wrapper">
      <div class="manage-departures-container">
        <!-- Header -->
        <div class="page-header">
          <div class="header-left">
            <button class="back-btn" (click)="goBack()">
              <i class="icon">←</i>
              <span>Quay lại</span>
            </button>
            <h1 class="page-title">
              <i class="icon">🚀</i>
              Quản lý Lịch Khởi Hành
            </h1>
          </div>
          <button class="add-btn" (click)="goToAddDeparture()">
            <i class="icon">➕</i>
            <span>Thêm Lịch Khởi Hành</span>
          </button>
        </div>

        <!-- Filter and Stats -->
        <div class="stats-grid">
          <div class="stat-card upcoming">
            <div class="stat-icon">📅</div>
            <div class="stat-info">
              <div class="stat-value">{{ getCountByStatus('upcoming') }}</div>
              <div class="stat-label">Sắp khởi hành</div>
            </div>
          </div>
          <div class="stat-card ongoing">
            <div class="stat-icon">✈️</div>
            <div class="stat-info">
              <div class="stat-value">{{ getCountByStatus('ongoing') }}</div>
              <div class="stat-label">Đang diễn ra</div>
            </div>
          </div>
          <div class="stat-card completed">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <div class="stat-value">{{ getCountByStatus('completed') }}</div>
              <div class="stat-label">Đã hoàn thành</div>
            </div>
          </div>
          <div class="stat-card total">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <div class="stat-value">{{ departures.length }}</div>
              <div class="stat-label">Tổng số lịch</div>
            </div>
          </div>
        </div>

        <!-- Filter Card -->
        <div class="filter-card">
          <div class="filter-group">
            <label>
              <i class="icon">🗺️</i>
              Lọc theo Tour
            </label>
            <select class="form-select" [(ngModel)]="selectedTourFilter" (change)="applyFilter()">
              <option value="">-- Tất cả tour --</option>
              <option *ngFor="let tour of tours" [value]="tour.tourID">
                {{ tour.tourName }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>
              <i class="icon">🎯</i>
              Lọc theo Trạng thái
            </label>
            <select class="form-select" [(ngModel)]="selectedStatusFilter" (change)="applyFilter()">
              <option value="">-- Tất cả trạng thái --</option>
              <option value="upcoming">Sắp khởi hành</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="completed">Đã hoàn thành</option>
            </select>
          </div>

          <div class="filter-group">
            <div class="search-box">
              <i class="icon">🔍</i>
              <input
                type="text"
                placeholder="Tìm kiếm theo điểm khởi hành..."
                [(ngModel)]="searchTerm"
                (input)="applyFilter()"
              >
            </div>
          </div>

          <button class="refresh-btn" (click)="loadDepartures()" [disabled]="loading">
            <i class="icon" [class.spinning]="loading">🔄</i>
            <span>Làm mới</span>
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Đang tải danh sách lịch khởi hành...</p>
        </div>

        <!-- Departures Table -->
        <div *ngIf="!loading" class="table-card">
          <div class="table-header">
            <h2>Danh sách Lịch Khởi Hành ({{ filteredDepartures.length }})</h2>
          </div>
          
          <div class="table-responsive">
            <table class="departures-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tour</th>
                  <th>Thời lượng</th>
                  <th>Điểm khởi hành</th>
                  <th>Khởi hành</th>
                  <th>Kết thúc</th>
                  <th>Giá</th>
                  <th>Số chỗ</th>
                  <th>Hướng dẫn viên</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let departure of filteredDepartures" class="departure-row">
                  <td class="departure-id">{{ departure.departureID }}</td>
                  <td class="tour-info">
                    <div class="tour-cell">
                      <strong>{{ departure.tour.tourName }}</strong>
                      <small class="destination">📍 {{ departure.tour.touristDestination }}</small>
                    </div>
                  </td>
                  <td class="duration">
                    <span class="duration-badge">
                      {{ departure.dayNum }}N{{ departure.dayNum - 1 }}Đ
                    </span>
                  </td>
                  <td class="location">
                    {{ departure.departureLocation }}
                  </td>
                  <td class="datetime">
                    {{ formatDateTime(departure.departureTime) }}
                  </td>
                  <td class="datetime">
                    {{ formatDateTime(departure.returnTime) }}
                  </td>
                  <td class="price">
                    <span class="price-value">
                      {{ formatPrice(departure.originalPrice) }}
                    </span>
                  </td>
                  <td class="capacity">
                    <div class="capacity-info">
                      <span class="current">{{ departure.currentBookings || 0 }}</span>
                      <span class="separator">/</span>
                      <span class="max">{{ departure.maxQuantity }}</span>
                    </div>
                    <div class="capacity-bar">
                      <div 
                        class="capacity-fill" 
                        [style.width.%]="getCapacityPercent(departure)"
                        [class.full]="getCapacityPercent(departure) >= 100"
                      ></div>
                    </div>
                  </td>
                  <td class="guide-info">
                    <div *ngIf="departure.tourGuide" class="guide-cell">
                      <div class="guide-name">👤 {{ departure.tourGuide.fullname }}</div>
                      <div class="guide-rating" *ngIf="departure.tourGuide.rating">
                        ⭐ {{ departure.tourGuide.rating }}
                      </div>
                    </div>
                    <div *ngIf="!departure.tourGuide" class="no-guide">
                      <span class="unassigned-badge">⚠️ Chưa phân công</span>
                    </div>
                  </td>
                  <td class="status">
                    <span 
                      class="status-badge" 
                      [class.upcoming]="departure.status === 'upcoming'"
                      [class.ongoing]="departure.status === 'ongoing'"
                      [class.completed]="departure.status === 'completed'"
                    >
                      {{ getStatusLabel(departure.status) }}
                    </span>
                  </td>
                  <td class="actions">
                    <button 
                      class="btn-edit" 
                      (click)="editDeparture(departure.departureID)"
                      title="Chỉnh sửa"
                      [disabled]="departure.status === 'completed'"
                    >
                      <i class="icon">✏️</i>
                      Sửa
                    </button>
                    <button 
                      class="btn-delete" 
                      (click)="confirmDelete(departure)"
                      title="Xóa"
                    >
                      <i class="icon">🗑️</i>
                      Xóa
                    </button>
                  </td>
                </tr>
                <tr *ngIf="filteredDepartures.length === 0" class="empty-row">
                  <td colspan="11" class="empty-message">
                    <i class="icon">📭</i>
                    <p>Không tìm thấy lịch khởi hành nào</p>
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
              <p>Bạn có chắc chắn muốn xóa lịch khởi hành này?</p>
              <div class="departure-info" *ngIf="departureToDelete">
                <strong>{{ departureToDelete.tour.tourName }}</strong>
                <p>Khởi hành: {{ formatDateTime(departureToDelete.departureTime || '') }}</p>
                <p class="warning" *ngIf="departureToDelete.currentBookings && departureToDelete.currentBookings > 0">
                  ⚠️ Đã có {{ departureToDelete.currentBookings }} người đặt tour này!
                </p>
              </div>
              <p class="warning">⚠️ Hành động này không thể hoàn tác!</p>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" (click)="closeDeleteModal()">
                Hủy
              </button>
              <button 
                class="btn-confirm-delete" 
                (click)="deleteDeparture()"
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
    .manage-departures-wrapper {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .manage-departures-container {
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

    .add-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      border: none;
      color: white;
      border-radius: 30px;
      cursor: pointer;
      font-weight: 700;
      font-size: 15px;
      box-shadow: 0 8px 20px rgba(67, 233, 123, 0.3);
      transition: all 0.3s ease;
    }

    .add-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(67, 233, 123, 0.4);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
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
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    }

    .stat-card.upcoming .stat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-card.ongoing .stat-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .stat-card.completed .stat-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-card.total .stat-icon {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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

    .departures-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .departures-table thead {
      background: #f8f9fa;
    }

    .departures-table th {
      padding: 16px 20px;
      text-align: left;
      font-weight: 700;
      color: #333;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e0e0e0;
    }

    .departures-table td {
      padding: 20px 20px;
      border-bottom: 1px solid #f0f0f0;
      color: #555;
    }

    .departure-row:hover {
      background: #f8f9ff;
    }

    .departure-id {
      font-weight: 700;
      color: #667eea;
      font-size: 16px;
    }

    .tour-cell {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .tour-cell strong {
      color: #333;
      font-size: 14px;
    }

    .tour-cell small {
      color: #888;
      font-size: 12px;
    }

    .duration-badge {
      display: inline-block;
      padding: 6px 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
    }

    .location {
      color: #555;
      max-width: 200px;
    }

    .datetime {
      font-size: 13px;
      color: #666;
      white-space: nowrap;
    }

    .price-value {
      font-weight: 700;
      color: #43e97b;
      font-size: 15px;
    }

    .capacity-info {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 5px;
    }

    .capacity-info .current {
      font-weight: 700;
      color: #667eea;
    }

    .capacity-info .separator {
      color: #ccc;
    }

    .capacity-info .max {
      color: #888;
    }

    .capacity-bar {
      width: 100px;
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
    }

    .capacity-fill {
      height: 100%;
      background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
      transition: width 0.3s ease;
    }

    .capacity-fill.full {
      background: linear-gradient(90deg, #f5576c 0%, #f093fb 100%);
    }

    .guide-info {
      min-width: 150px;
    }

    .guide-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .guide-name {
      font-weight: 600;
      color: #333;
      font-size: 13px;
    }

    .guide-rating {
      font-size: 12px;
      color: #f39c12;
    }

    .no-guide {
      text-align: center;
    }

    .unassigned-badge {
      display: inline-block;
      padding: 4px 10px;
      background: rgba(243, 156, 18, 0.1);
      color: #f39c12;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }

    .status-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
    }

    .status-badge.upcoming {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .status-badge.ongoing {
      background: rgba(245, 87, 108, 0.1);
      color: #f5576c;
    }

    .status-badge.completed {
      background: rgba(67, 233, 123, 0.1);
      color: #43e97b;
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    .btn-edit, .btn-delete {
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

    .btn-edit {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .btn-edit:hover:not(:disabled) {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
    }

    .btn-edit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-delete {
      background: rgba(245, 87, 108, 0.1);
      color: #f5576c;
    }

    .btn-delete:hover {
      background: #f5576c;
      color: white;
      transform: translateY(-2px);
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

    .departure-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 10px;
      margin: 15px 0;
    }

    .departure-info strong {
      color: #333;
      font-size: 16px;
      display: block;
      margin-bottom: 8px;
    }

    .departure-info p {
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

    @media (max-width: 1200px) {
      .departures-table {
        font-size: 13px;
      }

      .departures-table th,
      .departures-table td {
        padding: 12px 15px;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
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

      .departures-table {
        min-width: 1200px;
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
export class ManageTourDeparturesComponent implements OnInit {
  departures: TourDeparture[] = [];
  filteredDepartures: TourDeparture[] = [];
  tours: Tour[] = [];
  
  selectedTourFilter: string = '';
  selectedStatusFilter: string = '';
  searchTerm: string = '';
  
  loading = false;
  showDeleteModal = false;
  departureToDelete: TourDeparture | null = null;
  deleting = false;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private tourService: TourService,
    private tourDepartureService: TourDepartureService
  ) {}

  ngOnInit(): void {
    this.loadTours();
    this.loadDepartures();
  }

  /**
   * Tải danh sách tours từ TourService
   */
  loadTours(): void {
    this.tourService.getTours().subscribe({
      next: (tours: any[]) => {
        this.tours = tours.map(t => ({
          tourID: t.tourID,
          tourName: t.tourName,
          touristDestination: t.touristDestination
        }));
      },
      error: (err) => {
        console.error('Error loading tours:', err);
        this.toastService.error('Lỗi tải danh sách tour');
      }
    });
  }

  /**
   * Tải danh sách lịch khởi hành từ TourDepartureService
   */
  loadDepartures(): void {
    this.loading = true;
    this.tourDepartureService.getAllDepartures().subscribe({
      next: (response: any[]) => {
        // Transform flat API response to nested frontend model
        this.departures = response.map(r => ({
          departureID: r.tourDepartureID,
          tour: {
            tourID: r.tourID,
            tourName: r.tourName,
            touristDestination: r.touristDestination
          },
          dayNum: r.dayNum,
          originalPrice: r.originalPrice,
          departureLocation: r.departureLocation,
          departureTime: r.departureTime,
          returnTime: r.returnTime,
          maxQuantity: r.maxQuantity,
          currentBookings: r.maxQuantity - r.availableSlots,
          status: this.calculateStatus(r.departureTime, r.returnTime),
          tourGuide: r.tourGuide ? {
            tourGuideID: r.tourGuide.tourGuideID,
            fullname: r.tourGuide.fullname,
            rating: r.tourGuide.rating
          } : undefined
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading departures:', err);
        this.toastService.error('Không thể tải danh sách lịch khởi hành');
        this.loading = false;
        this.departures = [];
        this.filteredDepartures = [];
      }
    });
  }

  calculateStatus(departureTime: string, returnTime: string): 'upcoming' | 'ongoing' | 'completed' {
    const now = new Date();
    const departure = new Date(departureTime);
    const returnDate = new Date(returnTime);

    if (now < departure) {
      return 'upcoming';
    } else if (now >= departure && now <= returnDate) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  }

  applyFilter(): void {
    let filtered = [...this.departures];

    // Filter by tour
    if (this.selectedTourFilter) {
      const tourId = Number(this.selectedTourFilter);
      filtered = filtered.filter(d => d.tour.tourID === tourId);
    }

    // Filter by status
    if (this.selectedStatusFilter) {
      filtered = filtered.filter(d => d.status === this.selectedStatusFilter);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(d =>
        d.departureLocation.toLowerCase().includes(term) ||
        d.tour.tourName.toLowerCase().includes(term) ||
        d.tour.touristDestination.toLowerCase().includes(term)
      );
    }

    this.filteredDepartures = filtered;
  }

  getCountByStatus(status: string): number {
    return this.departures.filter(d => d.status === status).length;
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'upcoming': return 'Sắp khởi hành';
      case 'ongoing': return 'Đang diễn ra';
      case 'completed': return 'Đã hoàn thành';
      default: return 'Không rõ';
    }
  }

  getCapacityPercent(departure: TourDeparture): number {
    const current = departure.currentBookings || 0;
    const max = departure.maxQuantity || 1;
    return (current / max) * 100;
  }

  formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
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

  editDeparture(departureId: number): void {
    this.router.navigate(['/admin/departures/edit', departureId]);
  }

  confirmDelete(departure: TourDeparture): void {
    this.departureToDelete = departure;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.departureToDelete = null;
  }

  /**
   * Xóa lịch khởi hành sử dụng TourDepartureService
   */
  deleteDeparture(): void {
    if (!this.departureToDelete) return;

    this.deleting = true;
    const departureId = this.departureToDelete.departureID;

    this.tourDepartureService.deleteDeparture(departureId).subscribe({
      next: () => {
        this.toastService.success('Xóa lịch khởi hành thành công');
        this.deleting = false;
        this.closeDeleteModal();
        this.loadDepartures();
      },
      error: (err) => {
        console.error('Error deleting departure:', err);
        const errorMsg = err.error?.message || 'Không thể xóa lịch khởi hành. Vui lòng thử lại';
        this.toastService.error(errorMsg);
        this.deleting = false;
      }
    });
  }

  goToAddDeparture(): void {
    this.router.navigate(['/admin/departures/add']);
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
