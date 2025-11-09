import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ToastService } from '../../../app/shared/services/toast.service';
import { TourDepartureService } from '../../../app/core/services/api/tour-departure.service';

interface Tour {
  tourID: number;
  tourName: string;
  touristDestination: string;
  dayNum: number;
}

interface TourDepartureDetail {
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
}

@Component({
  selector: 'app-edit-tour-departure',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="edit-departure-wrapper">
      <div class="edit-departure-container">
        <!-- Header -->
        <div class="page-header">
          <button class="back-btn" (click)="goBack()">
            <i class="icon">←</i>
            <span>Quay lại</span>
          </button>
          <h1 class="page-title">
            <i class="icon">✏️</i>
            Chỉnh Sửa Lịch Khởi Hành
          </h1>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>

        <!-- Form -->
        <form *ngIf="!loading && departure" (ngSubmit)="onSubmit()" class="departure-form">
          <!-- Tour Selection (Disabled) -->
          <div class="form-group">
            <label>
              <i class="icon">🗺️</i>
              Tour
            </label>
            <input 
              type="text" 
              class="form-control" 
              [value]="departure.tourName + ' - ' + departure.touristDestination"
              disabled
            />
            <small class="form-hint">Không thể thay đổi tour sau khi tạo</small>
          </div>

          <!-- Departure Location -->
          <div class="form-group">
            <label>
              <i class="icon">📍</i>
              Điểm Khởi Hành *
            </label>
            <input 
              type="text" 
              class="form-control"
              [(ngModel)]="departure.departureLocation"
              name="departureLocation"
              placeholder="Nhập điểm khởi hành"
              required
            />
          </div>

          <!-- Departure Time -->
          <div class="form-group">
            <label>
              <i class="icon">🕐</i>
              Thời Gian Khởi Hành *
            </label>
            <input 
              type="datetime-local" 
              class="form-control"
              [(ngModel)]="departureTimeLocal"
              name="departureTime"
              required
            />
          </div>

          <!-- Return Time -->
          <div class="form-group">
            <label>
              <i class="icon">🕐</i>
              Thời Gian Trở Về *
            </label>
            <input 
              type="datetime-local" 
              class="form-control"
              [(ngModel)]="returnTimeLocal"
              name="returnTime"
              required
            />
            <small class="form-hint">Thời gian về phải sau thời gian khởi hành {{ departure.dayNum }} ngày</small>
          </div>

          <!-- Max Quantity -->
          <div class="form-group">
            <label>
              <i class="icon">👥</i>
              Số Lượng Tối Đa *
            </label>
            <input 
              type="number" 
              class="form-control"
              [(ngModel)]="departure.maxQuantity"
              name="maxQuantity"
              min="1"
              required
            />
            <small class="form-hint" *ngIf="currentBookings > 0">
              ⚠️ Hiện có {{ currentBookings }} người đã đặt. Số lượng tối đa phải ≥ {{ currentBookings }}
            </small>
          </div>

          <!-- Original Price -->
          <div class="form-group">
            <label>
              <i class="icon">💰</i>
              Giá Gốc (VNĐ) *
            </label>
            <input 
              type="number" 
              class="form-control"
              [(ngModel)]="departure.originalPrice"
              name="originalPrice"
              min="0"
              step="1000"
              required
            />
            <small class="form-hint">{{ formatPrice(departure.originalPrice) }}</small>
          </div>

          <!-- Day Number (Display Only) -->
          <div class="form-group">
            <label>
              <i class="icon">📅</i>
              Số Ngày
            </label>
            <input 
              type="number" 
              class="form-control"
              [value]="departure.dayNum"
              disabled
            />
            <small class="form-hint">Được lấy từ thông tin tour</small>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="error-message">
            <i class="icon">⚠️</i>
            {{ errorMessage }}
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button 
              type="button" 
              class="btn-cancel" 
              (click)="goBack()"
              [disabled]="submitting"
            >
              <i class="icon">✖️</i>
              Hủy
            </button>
            <button 
              type="submit" 
              class="btn-submit"
              [disabled]="submitting || !isFormValid()"
            >
              <span *ngIf="!submitting">
                <i class="icon">💾</i>
                Lưu Thay Đổi
              </span>
              <span *ngIf="submitting" class="btn-loading">
                <div class="spinner-small"></div>
                Đang lưu...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .edit-departure-wrapper {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .edit-departure-container {
      max-width: 800px;
      margin: 0 auto;
    }

    /* Header */
    .page-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateX(-5px);
    }

    .page-title {
      color: white;
      font-size: 28px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
    }

    /* Loading */
    .loading-container {
      background: white;
      border-radius: 12px;
      padding: 60px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Form */
    .departure-form {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control:disabled {
      background: #f5f5f5;
      color: #999;
      cursor: not-allowed;
    }

    .form-hint {
      display: block;
      margin-top: 6px;
      font-size: 12px;
      color: #666;
    }

    .form-hint i {
      font-size: 14px;
    }

    /* Error Message */
    .error-message {
      background: #ffebee;
      border-left: 4px solid #d32f2f;
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #d32f2f;
      font-size: 14px;
    }

    /* Action Buttons */
    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    .btn-cancel,
    .btn-submit {
      display: flex;
      align-items: center;
      gap: 8px;
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

    .btn-cancel:hover:not(:disabled) {
      background: #d0d0d0;
    }

    .btn-submit {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-width: 150px;
      justify-content: center;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-submit:disabled,
    .btn-cancel:disabled {
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

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn-cancel,
      .btn-submit {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class EditTourDepartureComponent implements OnInit {
  departureId: number = 0;
  departure: TourDepartureDetail | null = null;
  departureTimeLocal: string = '';
  returnTimeLocal: string = '';
  currentBookings: number = 0;
  
  loading = false;
  submitting = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private tourDepartureService: TourDepartureService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.departureId = Number(params['id']);
      if (this.departureId) {
        this.loadDepartureDetail();
      }
    });
  }

  /**
   * Tải thông tin chi tiết lịch khởi hành từ TourDepartureService
   */
  loadDepartureDetail(): void {
    this.loading = true;
    this.errorMessage = '';

    this.tourDepartureService.getDepartureById(this.departureId)
      .subscribe({
        next: (data: any) => {
          this.departure = data;
          
          // Convert ISO string to datetime-local format
          this.departureTimeLocal = this.convertToDateTimeLocal(data.departureTime);
          this.returnTimeLocal = this.convertToDateTimeLocal(data.returnTime);
          
          // Calculate current bookings
          this.currentBookings = data.maxQuantity - (data.availableSlots || 0);
          
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading departure:', err);
          this.errorMessage = 'Không thể tải thông tin lịch khởi hành';
          this.loading = false;
          this.toastService.error('Không thể tải thông tin lịch khởi hành');
        }
      });
  }

  convertToDateTimeLocal(isoString: string): string {
    // Convert "2024-10-25T08:00:00" to "2024-10-25T08:00"
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  convertToISOString(dateTimeLocal: string): string {
    // Convert "2024-10-25T08:00" to "2024-10-25T08:00:00"
    return dateTimeLocal + ':00';
  }

  isFormValid(): boolean {
    if (!this.departure) return false;

    const hasRequiredFields = 
      this.departure.departureLocation.trim() !== '' &&
      this.departureTimeLocal !== '' &&
      this.returnTimeLocal !== '' &&
      this.departure.maxQuantity > 0 &&
      this.departure.originalPrice > 0;

    if (!hasRequiredFields) return false;

    // Validate max quantity >= current bookings
    if (this.departure.maxQuantity < this.currentBookings) {
      return false;
    }

    // Validate return time > departure time
    const depTime = new Date(this.departureTimeLocal);
    const retTime = new Date(this.returnTimeLocal);
    if (retTime <= depTime) {
      return false;
    }

    return true;
  }

  onSubmit(): void {
    if (!this.isFormValid() || !this.departure) return;

    // Validate dates
    const depTime = new Date(this.departureTimeLocal);
    const retTime = new Date(this.returnTimeLocal);
    
    if (retTime <= depTime) {
      this.errorMessage = 'Thời gian trở về phải sau thời gian khởi hành';
      return;
    }

    // Validate max quantity
    if (this.departure.maxQuantity < this.currentBookings) {
      this.errorMessage = `Số lượng tối đa phải lớn hơn hoặc bằng ${this.currentBookings} (số người đã đặt)`;
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const updateData = {
      tourID: this.departure.tourID,
      departureLocation: this.departure.departureLocation.trim(),
      departureTime: this.convertToISOString(this.departureTimeLocal),
      returnTime: this.convertToISOString(this.returnTimeLocal),
      maxQuantity: Number(this.departure.maxQuantity),
      originalPrice: Number(this.departure.originalPrice),
      dayNum: this.departure.dayNum
    };

    /**
     * Cập nhật lịch khởi hành sử dụng TourDepartureService
     */
    this.tourDepartureService.updateDeparture(this.departureId, updateData)
      .subscribe({
        next: () => {
          this.toastService.success('Cập nhật lịch khởi hành thành công!');
          this.submitting = false;
          this.router.navigate(['/admin/departures']);
        },
        error: (err) => {
          console.error('Error updating departure:', err);
          this.errorMessage = err.error?.message || 'Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.';
          this.submitting = false;
          this.toastService.error(this.errorMessage);
        }
      });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0);
  }

  goBack(): void {
    this.router.navigate(['/admin/departures']);
  }
}
