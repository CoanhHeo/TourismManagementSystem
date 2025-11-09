import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../app/shared/services/toast.service';
import { TourService } from '../../../app/core/services/api/tour.service';
import { TourDepartureService } from '../../../app/core/services/api/tour-departure.service';
import { TourGuideService, TourGuide } from '../../../app/core/services/api/tour-guide.service';

interface TourDepartureForm {
  tour: {
    tourID: number;
  };
  dayNum: number;
  originalPrice: number;
  departureLocation: string;
  departureTime: string;
  returnTime: string;
  maxQuantity: number;
}

@Component({
  selector: 'app-add-tour-departure',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="add-departure-wrapper">
      <div class="add-departure-container">
        <!-- Header -->
        <div class="page-header">
          <button class="back-btn" (click)="goBack()">
            <i class="icon">←</i>
            <span>Quay lại</span>
          </button>
          <h1 class="page-title">
            <i class="icon">🚀</i>
            Thêm Lịch Khởi Hành
          </h1>
        </div>

        <!-- Form -->
        <div class="form-card">
          <form (ngSubmit)="onSubmit()" #departureForm="ngForm">
            <div class="form-grid">
              <!-- Tour Selection -->
              <div class="form-group full-width">
                <label class="form-label required">
                  <i class="icon">🗺️</i>
                  Chọn Tour
                </label>
                <select
                  class="form-select"
                  [(ngModel)]="formData.tour.tourID"
                  name="tourID"
                  required
                  (change)="onTourChange()"
                >
                  <option value="0">-- Chọn tour --</option>
                  <option *ngFor="let tour of tours" [value]="tour.tourID">
                    {{ tour.tourName }} - {{ tour.touristDestination }}
                  </option>
                </select>
              </div>

              <!-- Day Number (Auto-calculated) -->
              <div class="form-group">
                <label class="form-label required">
                  <i class="icon">📅</i>
                  Số ngày
                </label>
                <input
                  type="number"
                  class="form-input readonly-input"
                  [(ngModel)]="formData.dayNum"
                  name="dayNum"
                  readonly
                  placeholder="Tự động tính"
                >
                <small class="hint" *ngIf="formData.dayNum > 0">
                  {{ formData.dayNum }} ngày {{ formData.dayNum - 1 }} đêm (Tự động tính từ ngày khởi hành và kết thúc)
                </small>
                <small class="hint warning" *ngIf="formData.dayNum === 0">
                  ⚠️ Vui lòng chọn ngày khởi hành và kết thúc để tính số ngày
                </small>
              </div>

              <!-- Original Price -->
              <div class="form-group">
                <label class="form-label required">
                  <i class="icon">💰</i>
                  Giá gốc (VNĐ)
                </label>
                <input
                  type="number"
                  class="form-input"
                  [(ngModel)]="formData.originalPrice"
                  name="originalPrice"
                  required
                  min="0"
                  step="10000"
                  placeholder="VD: 5000000"
                >
                <small class="hint" *ngIf="formData.originalPrice > 0">
                  {{ formatPrice(formData.originalPrice) }}₫
                </small>
              </div>

              <!-- Departure Location -->
              <div class="form-group full-width">
                <label class="form-label required">
                  <i class="icon">🚩</i>
                  Điểm tập trung
                </label>
                <input
                  type="text"
                  class="form-input"
                  [(ngModel)]="formData.departureLocation"
                  name="departureLocation"
                  required
                  placeholder="VD: Công viên 23/9, TP.HCM"
                  maxlength="255"
                >
              </div>

              <!-- Departure Time -->
              <div class="form-group">
                <label class="form-label required">
                  <i class="icon">🕐</i>
                  Thời gian khởi hành
                </label>
                <input
                  type="datetime-local"
                  class="form-input"
                  [(ngModel)]="formData.departureTime"
                  name="departureTime"
                  required
                  [min]="getMinDateTime()"
                  (change)="calculateDayNum()"
                >
              </div>

              <!-- Return Time -->
              <div class="form-group">
                <label class="form-label required">
                  <i class="icon">🏁</i>
                  Thời gian kết thúc
                </label>
                <input
                  type="datetime-local"
                  class="form-input"
                  [(ngModel)]="formData.returnTime"
                  name="returnTime"
                  required
                  [min]="formData.departureTime"
                  (change)="calculateDayNum()"
                >
                <small class="hint warning" *ngIf="isReturnTimeInvalid()">
                  ⚠️ Thời gian kết thúc phải sau thời gian khởi hành
                </small>
              </div>

              <!-- Max Quantity -->
              <div class="form-group">
                <label class="form-label required">
                  <i class="icon">👥</i>
                  Số chỗ tối đa
                </label>
                <input
                  type="number"
                  class="form-input"
                  [(ngModel)]="formData.maxQuantity"
                  name="maxQuantity"
                  required
                  min="1"
                  max="100"
                  placeholder="VD: 30"
                >
              </div>

              <!-- 🎯 Tour Guides Selection (NEW) -->
              <div class="form-group full-width">
                <label class="form-label">
                  <i class="icon">🎯</i>
                  Chỉ định Hướng Dẫn Viên (Tùy chọn - chỉ được chọn 1 người)
                </label>
                <div class="guides-loading" *ngIf="loadingGuides">
                  <span class="spinner-small"></span>
                  Đang tải danh sách hướng dẫn viên...
                </div>
                <div class="guides-selection" *ngIf="!loadingGuides && availableGuides.length > 0">
                  <div class="guides-grid">
                    <div 
                      *ngFor="let guide of availableGuides" 
                      class="guide-radio-item"
                      [class.selected]="isGuideSelected(guide.tourGuideID)"
                      (click)="selectGuide(guide.tourGuideID)">
                      <input 
                        type="radio" 
                        name="selectedGuide"
                        [checked]="isGuideSelected(guide.tourGuideID)"
                        (click)="$event.stopPropagation()">
                      <div class="guide-info-compact">
                        <div class="guide-name">{{ guide.fullname }}</div>
                        <div class="guide-details">
                          <span class="guide-rating" *ngIf="guide.rating">⭐ {{ guide.rating }}</span>
                          <span class="guide-lang" *ngIf="guide.languages">🌐 {{ guide.languages }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <small class="hint" *ngIf="selectedGuideId">
                    ✓ Đã chọn hướng dẫn viên: {{ getSelectedGuideName() }}
                  </small>
                </div>
                <div class="no-guides" *ngIf="!loadingGuides && availableGuides.length === 0">
                  ⚠️ Không có hướng dẫn viên nào khả dụng
                </div>
              </div>
            </div>

            <!-- Preview Section -->
            <div class="preview-card" *ngIf="formData.tour.tourID > 0">
              <h3>
                <i class="icon">👁️</i>
                Xem trước
              </h3>
              <div class="preview-grid">
                <div class="preview-item">
                  <span class="preview-label">Tour:</span>
                  <span class="preview-value">{{ getSelectedTourName() }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Thời lượng:</span>
                  <span class="preview-value">{{ formData.dayNum }} ngày {{ formData.dayNum - 1 }} đêm</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Giá:</span>
                  <span class="preview-value">{{ formatPrice(formData.originalPrice) }}₫/người</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Số chỗ:</span>
                  <span class="preview-value">{{ formData.maxQuantity }} người</span>
                </div>
                <div class="preview-item" *ngIf="formData.departureTime">
                  <span class="preview-label">Khởi hành:</span>
                  <span class="preview-value">{{ formatDateTime(formData.departureTime) }}</span>
                </div>
                <div class="preview-item" *ngIf="formData.returnTime">
                  <span class="preview-label">Kết thúc:</span>
                  <span class="preview-value">{{ formatDateTime(formData.returnTime) }}</span>
                </div>
                <div class="preview-item" *ngIf="selectedGuideId">
                  <span class="preview-label">Hướng dẫn viên:</span>
                  <span class="preview-value">👤 {{ getSelectedGuideName() }}</span>
                </div>
                <div class="preview-item" *ngIf="!selectedGuideId">
                  <span class="preview-label">Hướng dẫn viên:</span>
                  <span class="preview-value" style="color: #f39c12;">⚠️ Chưa chọn</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="form-actions">
              <button
                type="button"
                class="btn-secondary"
                (click)="resetForm()"
                [disabled]="submitting"
              >
                <i class="icon">🔄</i>
                Đặt lại
              </button>
              <button
                type="submit"
                class="btn-primary"
                [disabled]="!departureForm.valid || submitting"
                [class.loading]="submitting"
              >
                <span *ngIf="!submitting">
                  <i class="icon">✅</i>
                  Thêm Lịch Khởi Hành
                </span>
                <span *ngIf="submitting" class="btn-loading">
                  <div class="spinner"></div>
                  Đang xử lý...
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- Help Section -->
        <div class="help-card">
          <h3>
            <i class="icon">💡</i>
            Lưu ý
          </h3>
          <ul>
            <li>Thời gian khởi hành phải sau thời điểm hiện tại</li>
            <li>Thời gian kết thúc phải sau thời gian khởi hành</li>
            <li>Số ngày sẽ tự động tính dựa trên khoảng thời gian</li>
            <li>Giá tour sẽ được tính cho mỗi người tham gia</li>
            <li>Khuyến mãi được thiết lập ở cấp Tour, không phải lịch khởi hành</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .add-departure-wrapper {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .add-departure-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 30px;
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
      margin-bottom: 15px;
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

    .form-card, .help-card, .preview-card {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .form-label.required::after {
      content: '*';
      color: #f44336;
      margin-left: 4px;
    }

    .form-input, .form-select {
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 14px;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .readonly-input {
      background-color: #f5f5f5;
      color: #666;
      cursor: not-allowed;
      font-weight: 600;
    }

    .hint {
      color: #666;
      font-size: 12px;
      font-style: italic;
    }

    .hint.warning {
      color: #ff9800;
      font-weight: 600;
    }

    .preview-card {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
      border: 2px solid #667eea;
    }

    .preview-card h3 {
      color: #667eea;
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }

    .preview-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px;
      background: white;
      border-radius: 8px;
    }

    .preview-label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .preview-value {
      font-size: 15px;
      color: #333;
      font-weight: 600;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
    }

    .btn-primary, .btn-secondary {
      padding: 14px 28px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: none;
      font-size: 15px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      min-width: 200px;
      justify-content: center;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #f8f9fa;
    }

    .btn-loading {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .help-card h3 {
      color: #667eea;
      margin: 0 0 15px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
    }

    .help-card ul {
      margin: 0;
      padding-left: 20px;
      color: #666;
      line-height: 1.8;
    }

    .help-card li {
      margin-bottom: 8px;
    }

    .icon {
      font-size: 20px;
    }

    /* 🎯 Tour Guides Selection Styles */
    .guides-loading {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px;
      color: #666;
      font-size: 14px;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(102, 126, 234, 0.2);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    .guides-selection {
      margin-top: 8px;
    }

    .guides-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
      margin-bottom: 12px;
    }

    .guide-radio-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
    }

    .guide-radio-item:hover {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }

    .guide-radio-item.selected {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }

    .guide-radio-item input[type="radio"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      flex-shrink: 0;
    }

    .guide-info-compact {
      flex: 1;
      min-width: 0;
    }

    .guide-name {
      font-weight: 600;
      color: #333;
      font-size: 14px;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .guide-details {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #666;
    }

    .guide-rating {
      color: #f39c12;
    }

    .guide-lang {
      color: #3498db;
    }

    .no-guides {
      padding: 20px;
      text-align: center;
      color: #999;
      font-style: italic;
      background: #f9f9f9;
      border-radius: 8px;
    }

    @media (max-width: 768px) {
      .form-grid, .preview-grid {
        grid-template-columns: 1fr;
      }

      .guides-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn-primary, .btn-secondary {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class AddTourDepartureComponent implements OnInit {
  formData: TourDepartureForm = {
    tour: {
      tourID: 0
    },
    dayNum: 0,
    originalPrice: 0,
    departureLocation: '',
    departureTime: '',
    returnTime: '',
    maxQuantity: 30
  };

  tours: any[] = []; // Using any to support backend response
  availableGuides: TourGuide[] = []; // 🎯 Danh sách guides
  selectedGuideId: number | null = null; // 🎯 Single guide selection
  loadingGuides = false; // 🎯 Loading state
  submitting = false;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private tourService: TourService,
    private tourDepartureService: TourDepartureService,
    private tourGuideService: TourGuideService
  ) {}

  ngOnInit(): void {
    this.loadTours();
    this.loadAvailableGuides(); // 🎯 Load guides khi init
  }

  /**
   * Tải danh sách tours từ TourService
   */
  loadTours(): void {
    this.tourService.getTours().subscribe({
      next: (tours) => {
        this.tours = tours;
      },
      error: (err) => {
        console.error('Error loading tours:', err);
        this.toastService.error('Không thể tải danh sách tour');
      }
    });
  }

  /**
   * 🎯 Load danh sách Tour Guides available (role Tour Guide + active) từ TourGuideService
   */
  loadAvailableGuides(): void {
    this.loadingGuides = true;
    this.tourGuideService.getActiveTourGuides().subscribe({
      next: (guides) => {
        this.availableGuides = guides;
        this.loadingGuides = false;
      },
      error: (err) => {
        console.error('Error loading guides:', err);
        this.loadingGuides = false;
        // Don't show error toast - guides are optional
      }
    });
  }

  /**
   * 🎯 Select single guide (radio button logic)
   */
  selectGuide(guideId: number): void {
    this.selectedGuideId = guideId;
  }

  /**
   * 🎯 Check if guide is selected
   */
  isGuideSelected(guideId: number): boolean {
    return this.selectedGuideId === guideId;
  }

  /**
   * 🎯 Get selected guide name for display
   */
  getSelectedGuideName(): string {
    if (!this.selectedGuideId) return '';
    const guide = this.availableGuides.find(g => g.tourGuideID === this.selectedGuideId);
    return guide ? guide.fullname : '';
  }

  onTourChange(): void {
    // Can auto-fill some fields based on selected tour if needed
  }

  calculateDayNum(): void {
    // Auto-calculate dayNum based on departure and return time
    if (this.formData.departureTime && this.formData.returnTime) {
      const departure = new Date(this.formData.departureTime);
      const returnTime = new Date(this.formData.returnTime);
      
      // Calculate difference in milliseconds
      const diffMs = returnTime.getTime() - departure.getTime();
      
      // Convert to days and round up (ceiling)
      // If they select same day but different times, it should be 1 day
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      // Set dayNum (minimum 1 day)
      this.formData.dayNum = Math.max(1, diffDays);
    } else {
      // Reset to 0 if dates are not set
      this.formData.dayNum = 0;
    }
  }

  isReturnTimeInvalid(): boolean {
    if (!this.formData.returnTime || !this.formData.departureTime) {
      return false;
    }
    const departure = new Date(this.formData.departureTime);
    const returnTime = new Date(this.formData.returnTime);
    return returnTime <= departure;
  }

  getMinDateTime(): string {
    const now = new Date();
    now.setHours(now.getHours() + 1); // At least 1 hour from now
    return now.toISOString().slice(0, 16);
  }

  getSelectedTourName(): string {
    // Convert to Number để so sánh (ngModel trả về String)
    const selectedId = Number(this.formData.tour.tourID);
    const tour = this.tours.find(t => t.tourID === selectedId);
    return tour ? `${tour.tourName} - ${tour.touristDestination || ''}` : 'Chưa chọn tour';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price);
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onSubmit(): void {
    if (!this.formData.tour.tourID || this.formData.tour.tourID === 0) {
      this.toastService.error('Vui lòng chọn tour');
      return;
    }

    if (!this.formData.departureTime || !this.formData.returnTime) {
      this.toastService.error('Vui lòng nhập đầy đủ thời gian');
      return;
    }

    const departure = new Date(this.formData.departureTime);
    const returnTime = new Date(this.formData.returnTime);
    
    if (returnTime <= departure) {
      this.toastService.error('Thời gian kết thúc phải sau thời gian khởi hành');
      return;
    }

    if (this.formData.dayNum === 0) {
      this.toastService.error('Số ngày chưa được tính. Vui lòng kiểm tra lại thời gian');
      return;
    }

    this.submitting = true;

    // Prepare data for API
    const payload = {
      ...this.formData,
      tour: {
        tourID: Number(this.formData.tour.tourID) // Convert to Number (ngModel trả về String)
      },
      departureTime: new Date(this.formData.departureTime).toISOString(),
      returnTime: new Date(this.formData.returnTime).toISOString(),
      guideId: this.selectedGuideId // 🎯 Include selected guide (single)
    };

    /**
     * Tạo lịch khởi hành mới sử dụng TourDepartureService
     */
    this.tourDepartureService.createDeparture(payload).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.success) {
          const guidesMsg = response.assignedGuide 
            ? ' và phân công hướng dẫn viên thành công' 
            : '';
          this.toastService.success(`Thêm lịch khởi hành${guidesMsg} thành công!`);
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 1500);
        } else {
          this.toastService.error(response.message || 'Thêm lịch khởi hành thất bại');
        }
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error adding departure:', err);
        const errorMsg = err.error?.message || 'Không thể thêm lịch khởi hành. Vui lòng thử lại';
        this.toastService.error(errorMsg);
      }
    });
  }

  resetForm(): void {
    this.formData = {
      tour: { tourID: 0 },
      dayNum: 0,
      originalPrice: 0,
      departureLocation: '',
      departureTime: '',
      returnTime: '',
      maxQuantity: 30
    };
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
