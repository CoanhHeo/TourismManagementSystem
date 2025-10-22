import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourTypeService, TourType } from '../../../app/core/services/api/tour-type.service';
import { ToastService } from '../../../app/shared/services/toast.service';

/**
 * Component quản lý Tour Types cho Admin
 * 
 * Chức năng:
 * - Hiển thị danh sách loại tour
 * - Thêm mới loại tour
 * - Cập nhật loại tour
 * - Xóa loại tour
 * - Validation form input
 */
@Component({
  selector: 'app-admin-tour-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-tour-types-container">
      <!-- Header -->
      <div class="header-section">
        <h2>Quản Lý Loại Tour</h2>
        <button class="btn-add" (click)="openAddModal()">
          <span class="icon">+</span>
          Thêm Loại Tour
        </button>
      </div>

      <!-- Tour Types Table -->
      <div class="table-container">
        <table class="tour-types-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Loại Tour</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              <tr>
                <td colspan="3" class="loading-cell">
                  <div class="spinner"></div>
                  Đang tải dữ liệu...
                </td>
              </tr>
            } @else if (tourTypes().length === 0) {
              <tr>
                <td colspan="3" class="empty-cell">
                  Chưa có loại tour nào
                </td>
              </tr>
            } @else {
              @for (type of tourTypes(); track type.tourTypeID) {
                <tr>
                  <td>{{ type.tourTypeID }}</td>
                  <td>{{ type.tourTypeName }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-edit" (click)="openEditModal(type)">
                        ✏️ Sửa
                      </button>
                      <button 
                        class="btn-delete" 
                        (click)="deleteTourType(type.tourTypeID!)">
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ isEditMode() ? 'Cập Nhật Loại Tour' : 'Thêm Loại Tour Mới' }}</h3>
              <button class="btn-close" (click)="closeModal()">×</button>
            </div>
            
            <form (ngSubmit)="submitForm()" #tourTypeForm="ngForm">
              <div class="form-group">
                <label for="tourTypeName">Tên Loại Tour <span class="required">*</span></label>
                <input
                  type="text"
                  id="tourTypeName"
                  name="tourTypeName"
                  [(ngModel)]="formData().tourTypeName"
                  #tourTypeName="ngModel"
                  required
                  minlength="2"
                  maxlength="100"
                  placeholder="Ví dụ: Du lịch biển, Du lịch núi..."
                  class="form-control"
                />
                @if (tourTypeName.invalid && (tourTypeName.dirty || tourTypeName.touched)) {
                  <div class="error-message">
                    @if (tourTypeName.errors?.['required']) {
                      <span>Tên loại tour không được để trống</span>
                    }
                    @if (tourTypeName.errors?.['minlength']) {
                      <span>Tên loại tour phải có ít nhất 2 ký tự</span>
                    }
                    @if (tourTypeName.errors?.['maxlength']) {
                      <span>Tên loại tour không được quá 100 ký tự</span>
                    }
                  </div>
                }
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-cancel" (click)="closeModal()">
                  Hủy
                </button>
                <button 
                  type="submit" 
                  class="btn-submit" 
                  [disabled]="!tourTypeForm.valid || submitting()">
                  @if (submitting()) {
                    <span class="spinner-small"></span>
                  }
                  {{ isEditMode() ? 'Cập Nhật' : 'Thêm Mới' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteConfirm()) {
        <div class="modal-overlay" (click)="cancelDelete()">
          <div class="modal-content modal-small" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Xác Nhận Xóa</h3>
            </div>
            <div class="modal-body">
              <p>Bạn có chắc chắn muốn xóa loại tour này?</p>
              <p class="warning-text">⚠️ Hành động này không thể hoàn tác!</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="cancelDelete()">
                Hủy
              </button>
              <button 
                type="button" 
                class="btn-delete" 
                (click)="confirmDelete()"
                [disabled]="submitting()">
                @if (submitting()) {
                  <span class="spinner-small"></span>
                }
                Xóa
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-tour-types-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header-section h2 {
      color: #1e293b;
      font-size: 1.875rem;
      font-weight: 700;
      margin: 0;
    }

    .btn-add {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
    }

    .btn-add:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(102, 126, 234, 0.35);
    }

    .btn-add .icon {
      font-size: 1.25rem;
      font-weight: bold;
    }

    .table-container {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
      overflow: hidden;
    }

    .tour-types-table {
      width: 100%;
      border-collapse: collapse;
    }

    .tour-types-table thead {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .tour-types-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.875rem;
      letter-spacing: 0.05em;
    }

    .tour-types-table tbody tr {
      border-bottom: 1px solid #e2e8f0;
      transition: background-color 0.2s ease;
    }

    .tour-types-table tbody tr:hover {
      background-color: #f8fafc;
    }

    .tour-types-table td {
      padding: 1rem;
      color: #334155;
    }

    .loading-cell,
    .empty-cell {
      text-align: center;
      padding: 3rem !important;
      color: #64748b;
      font-size: 1rem;
    }

    .spinner {
      display: inline-block;
      width: 2rem;
      height: 2rem;
      border: 3px solid #e2e8f0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 0.5rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-edit,
    .btn-delete {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-edit {
      background-color: #3b82f6;
      color: white;
    }

    .btn-edit:hover {
      background-color: #2563eb;
      transform: translateY(-1px);
    }

    .btn-delete {
      background-color: #ef4444;
      color: white;
    }

    .btn-delete:hover:not(:disabled) {
      background-color: #dc2626;
      transform: translateY(-1px);
    }

    .btn-delete:disabled {
      background-color: #cbd5e1;
      cursor: not-allowed;
      opacity: 0.6;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 1rem;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      animation: slideUp 0.3s ease;
    }

    .modal-small {
      max-width: 400px;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h3 {
      margin: 0;
      color: #1e293b;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 2rem;
      color: #64748b;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
    }

    .btn-close:hover {
      background-color: #f1f5f9;
      color: #1e293b;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-body p {
      margin: 0 0 1rem 0;
      color: #475569;
    }

    .warning-text {
      color: #f59e0b;
      font-weight: 500;
    }

    form {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #334155;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .required {
      color: #ef4444;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .error-message {
      margin-top: 0.5rem;
      color: #ef4444;
      font-size: 0.875rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .btn-cancel,
    .btn-submit {
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-cancel {
      background-color: #f1f5f9;
      color: #475569;
    }

    .btn-cancel:hover {
      background-color: #e2e8f0;
    }

    .btn-submit {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner-small {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .admin-tour-types-container {
        padding: 1rem;
      }

      .header-section {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .header-section h2 {
        font-size: 1.5rem;
      }

      .btn-add {
        justify-content: center;
      }

      .table-container {
        overflow-x: auto;
      }

      .tour-types-table {
        min-width: 600px;
      }

      .modal-content {
        width: 95%;
        margin: 1rem;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn-edit,
      .btn-delete {
        width: 100%;
      }
    }
  `]
})
export class AdminTourTypesComponent implements OnInit {
  private tourTypeService = inject(TourTypeService);
  private toastService = inject(ToastService);

  // Signals
  tourTypes = signal<any[]>([]);
  loading = signal(false);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  isEditMode = signal(false);
  submitting = signal(false);
  formData = signal<TourType>({ tourTypeName: '' });
  deleteId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadTourTypes();
  }

  /**
   * Tải danh sách loại tour từ backend
   */
  loadTourTypes(): void {
    this.loading.set(true);
    this.tourTypeService.getAllTourTypes().subscribe({
      next: (data) => {
        this.tourTypes.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading tour types:', error);
        this.toastService.show('Lỗi tải danh sách loại tour', 'error');
        this.loading.set(false);
      }
    });
  }

  /**
   * Mở modal thêm loại tour mới
   */
  openAddModal(): void {
    this.isEditMode.set(false);
    this.formData.set({ tourTypeName: '' });
    this.showModal.set(true);
  }

  /**
   * Mở modal chỉnh sửa loại tour
   */
  openEditModal(tourType: any): void {
    this.isEditMode.set(true);
    this.formData.set({
      tourTypeID: tourType.tourTypeID,
      tourTypeName: tourType.tourTypeName
    });
    this.showModal.set(true);
  }

  /**
   * Đóng modal
   */
  closeModal(): void {
    this.showModal.set(false);
    this.formData.set({ tourTypeName: '' });
  }

  /**
   * Submit form thêm/sửa loại tour
   */
  submitForm(): void {
    if (!this.formData().tourTypeName.trim()) {
      this.toastService.show('Vui lòng nhập tên loại tour', 'error');
      return;
    }

    this.submitting.set(true);

    if (this.isEditMode()) {
      // Cập nhật
      const id = this.formData().tourTypeID!;
      this.tourTypeService.updateTourType(id, this.formData()).subscribe({
        next: () => {
          this.toastService.show('Cập nhật loại tour thành công', 'success');
          this.loadTourTypes();
          this.closeModal();
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('Error updating tour type:', error);
          this.toastService.show(
            error.error || 'Lỗi cập nhật loại tour', 
            'error'
          );
          this.submitting.set(false);
        }
      });
    } else {
      // Thêm mới
      this.tourTypeService.createTourType(this.formData()).subscribe({
        next: () => {
          this.toastService.show('Thêm loại tour thành công', 'success');
          this.loadTourTypes();
          this.closeModal();
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('Error creating tour type:', error);
          this.toastService.show(
            error.error || 'Lỗi thêm loại tour', 
            'error'
          );
          this.submitting.set(false);
        }
      });
    }
  }

  /**
   * Hiển thị dialog xác nhận xóa
   */
  deleteTourType(id: number): void {
    this.deleteId.set(id);
    this.showDeleteConfirm.set(true);
  }

  /**
   * Hủy xóa
   */
  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deleteId.set(null);
  }

  /**
   * Xác nhận xóa loại tour
   */
  confirmDelete(): void {
    const id = this.deleteId();
    if (!id) return;

    this.submitting.set(true);
    this.tourTypeService.deleteTourType(id).subscribe({
      next: () => {
        this.toastService.show('Xóa loại tour thành công', 'success');
        this.loadTourTypes();
        this.cancelDelete();
        this.submitting.set(false);
      },
      error: (error) => {
        console.error('Error deleting tour type:', error);
        this.toastService.show(
          error.error || 'Lỗi xóa loại tour', 
          'error'
        );
        this.submitting.set(false);
      }
    });
  }
}
