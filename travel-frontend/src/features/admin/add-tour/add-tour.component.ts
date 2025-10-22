import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../../app/shared/services/toast.service';
import { TourTypeService, TourType } from '../../../app/core/services/api/tour-type.service';
import { PromotionService, Promotion } from '../../../app/core/services/api/promotion.service';
import { TourService } from '../../../app/core/services/api/tour.service';

interface TourFormData {
  tourName: string;
  description: string;
  touristDestination: string;
  tourType: {
    tourTypeID: number;
  };
  promotion?: {
    promotionID: number;
  } | null;
}

@Component({
  selector: 'app-add-tour',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="add-tour-wrapper">
      <div class="add-tour-container">
        <!-- Header -->
        <div class="page-header">
          <button class="back-btn" (click)="goBack()">
            <i class="icon">←</i>
            <span>Quay lại</span>
          </button>
          <h1 class="page-title">
            <i class="icon">➕</i>
            Thêm Tour Mới
          </h1>
        </div>

        <!-- Form -->
        <div class="form-card">
          <form (ngSubmit)="onSubmit()" #tourForm="ngForm">
            <div class="form-grid">
              <!-- Tour Name -->
              <div class="form-group full-width">
                <label class="form-label required">
                  <i class="icon">🎯</i>
                  Tên Tour
                </label>
                <input
                  type="text"
                  class="form-input"
                  [(ngModel)]="formData.tourName"
                  name="tourName"
                  required
                  placeholder="Nhập tên tour..."
                  maxlength="200"
                >
                <small class="hint">Tên tour nên ngắn gọn, dễ hiểu</small>
              </div>

              <!-- Tourist Destination -->
              <div class="form-group">
                <label class="form-label required">
                  <i class="icon">📍</i>
                  Điểm đến
                </label>
                <input
                  type="text"
                  class="form-input"
                  [(ngModel)]="formData.touristDestination"
                  name="touristDestination"
                  required
                  placeholder="VD: Đà Lạt, Phú Quốc..."
                  maxlength="255"
                >
              </div>

              <!-- Tour Type -->
              <div class="form-group">
                <label class="form-label required">
                  <i class="icon">🏷️</i>
                  Loại Tour
                </label>
                <select
                  class="form-select"
                  [(ngModel)]="formData.tourType.tourTypeID"
                  name="tourType"
                  required
                >
                  <option value="">-- Chọn loại tour --</option>
                  <option *ngFor="let type of tourTypes" [value]="type.tourTypeID">
                    {{ type.tourTypeName }}
                  </option>
                </select>
              </div>

              <!-- Promotion -->
              <div class="form-group">
                <label class="form-label">
                  <i class="icon">🎁</i>
                  Khuyến mãi
                </label>
                <select
                  class="form-select"
                  [(ngModel)]="selectedPromotionID"
                  name="promotion"
                >
                  <option value="">-- Không áp dụng khuyến mãi --</option>
                  <option *ngFor="let promo of promotions" [value]="promo.promotionID">
                    {{ promo.promotionName }} ({{ promo.percent }}% - {{ formatDate(promo.startDate) }} đến {{ formatDate(promo.endDate) }})
                  </option>
                </select>
              </div>

              <!-- Description -->
              <div class="form-group full-width">
                <label class="form-label required">
                  <i class="icon">📝</i>
                  Mô tả
                </label>
                <textarea
                  class="form-textarea"
                  [(ngModel)]="formData.description"
                  name="description"
                  required
                  placeholder="Nhập mô tả chi tiết về tour..."
                  rows="6"
                  maxlength="2000"
                ></textarea>
                <small class="hint">{{ formData.description.length }}/2000 ký tự</small>
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
                [disabled]="!tourForm.valid || submitting"
                [class.loading]="submitting"
              >
                <span *ngIf="!submitting">
                  <i class="icon">✅</i>
                  Thêm Tour
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
            Hướng dẫn
          </h3>
          <ul>
            <li>Tên tour nên rõ ràng, dễ hiểu và thu hút khách hàng</li>
            <li>Điểm đến cần ghi đầy đủ tên địa danh</li>
            <li>Mô tả nên bao gồm các điểm nổi bật của tour</li>
            <li>Khuyến mãi là tùy chọn - chỉ hiển thị các khuyến mãi đang hoạt động</li>
            <li>Sau khi thêm tour, bạn có thể thêm lịch khởi hành</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .add-tour-wrapper {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .add-tour-container {
      max-width: 900px;
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

    .form-card, .help-card {
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

    .form-input, .form-select, .form-textarea {
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 14px;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-textarea {
      resize: vertical;
      min-height: 120px;
    }

    .hint {
      color: #666;
      font-size: 12px;
      font-style: italic;
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
      min-width: 150px;
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

    @media (max-width: 768px) {
      .form-grid {
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
export class AddTourComponent implements OnInit {
  formData: TourFormData = {
    tourName: '',
    description: '',
    touristDestination: '',
    tourType: {
      tourTypeID: 0
    },
    promotion: null
  };

  tourTypes: TourType[] = [];
  promotions: Promotion[] = [];
  selectedPromotionID: number | string = '';
  submitting = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService,
    private tourTypeService: TourTypeService,
    private promotionService: PromotionService,
    private tourService: TourService
  ) {}

  ngOnInit(): void {
    this.loadTourTypes();
    this.loadPromotions();
  }

  /**
   * Tải danh sách loại tour từ TourTypeService
   */
  loadTourTypes(): void {
    this.tourTypeService.getAllTourTypes().subscribe({
      next: (types) => {
        this.tourTypes = types;
      },
      error: (err) => {
        console.error('Error loading tour types:', err);
        this.toastService.show('Lỗi tải loại tour', 'error');
      }
    });
  }

  /**
   * Tải danh sách khuyến mãi đang active từ PromotionService
   */
  loadPromotions(): void {
    this.promotionService.getActivePromotions().subscribe({
      next: (promotions) => {
        this.promotions = promotions;
      },
      error: (err) => {
        console.error('Error loading promotions:', err);
        this.toastService.show('Lỗi tải khuyến mãi', 'error');
        this.promotions = [];
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  onSubmit(): void {
    if (!this.formData.tourName || !this.formData.description || 
        !this.formData.touristDestination || !this.formData.tourType.tourTypeID) {
      this.toastService.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Convert tourTypeID to Number (ngModel trả về String)
    this.formData.tourType.tourTypeID = Number(this.formData.tourType.tourTypeID);

    // Set promotion if selected
    if (this.selectedPromotionID && this.selectedPromotionID !== '') {
      this.formData.promotion = {
        promotionID: Number(this.selectedPromotionID)
      };
    } else {
      this.formData.promotion = null;
    }

    this.submitting = true;

    // Sử dụng TourService thay vì HTTP trực tiếp
    this.tourService.createTour(this.formData).subscribe({
      next: (response: any) => {
        this.submitting = false;
        if (response.success || response.tourID) {
          this.toastService.success('Thêm tour thành công!');
          setTimeout(() => {
            this.router.navigate(['/admin/tours']);
          }, 1500);
        } else {
          this.toastService.error(response.message || 'Thêm tour thất bại');
        }
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error adding tour:', err);
        const errorMsg = err.error?.message || 'Không thể thêm tour. Vui lòng thử lại';
        this.toastService.error(errorMsg);
      }
    });
  }

  resetForm(): void {
    this.formData = {
      tourName: '',
      description: '',
      touristDestination: '',
      tourType: {
        tourTypeID: 0
      },
      promotion: null
    };
    this.selectedPromotionID = '';
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
