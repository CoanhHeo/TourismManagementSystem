import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * Interface cho Promotion entity
 * Tương ứng với PromotionDTO từ backend
 */
export interface Promotion {
  promotionID?: number;      // Optional vì auto-generated khi create
  promotionName: string;      // Tên khuyến mãi
  percent: number;            // Phần trăm giảm giá (1-100)
  startDate: string;          // ISO date string (YYYY-MM-DD)
  endDate: string;            // ISO date string (YYYY-MM-DD)
}

/**
 * Interface cho thống kê khuyến mãi
 * Tương ứng với PromotionStatsDTO từ backend
 */
export interface PromotionStats {
  total: number;              // Tổng số khuyến mãi
  active: number;             // Số khuyến mãi đang hoạt động
  expired: number;            // Số khuyến mãi đã hết hạn
  upcoming: number;           // Số khuyến mãi sắp diễn ra
}

/**
 * Service xử lý các HTTP request liên quan đến Promotion
 * 
 * Base URL: /api/promotions
 * 
 * Features:
 * - CRUD operations cho khuyến mãi
 * - Lấy thống kê khuyến mãi
 * - Lấy danh sách active promotions
 * - Utility methods kiểm tra trạng thái promotion
 * 
 * @Injectable providedIn: 'root' - Singleton service
 */
@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  /** API base URL cho promotion endpoints */
  private apiUrl = `${environment.apiUrl}/promotions`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy tất cả khuyến mãi
   * 
   * Endpoint: GET /api/promotions
   * 
   * @returns Observable chứa mảng Promotion (có thể rỗng)
   */
  getAllPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.apiUrl);
  }

  /**
   * Lấy khuyến mãi theo ID
   * 
   * Endpoint: GET /api/promotions/{id}
   * 
   * @param id - ID của khuyến mãi cần lấy
   * @returns Observable chứa Promotion (404 error nếu không tìm thấy)
   */
  getPromotionById(id: number): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiUrl}/${id}`);
  }

  /**
   * Lấy thống kê khuyến mãi
   * 
   * Endpoint: GET /api/promotions/stats
   * 
   * Trả về 4 số liệu: total, active, expired, upcoming
   * 
   * @returns Observable chứa PromotionStats
   */
  getPromotionStats(): Observable<PromotionStats> {
    return this.http.get<PromotionStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Lấy danh sách khuyến mãi đang active
   * 
   * Endpoint: GET /api/promotions/active
   * 
   * Active: Ngày hiện tại nằm trong khoảng [startDate, endDate]
   * 
   * @returns Observable chứa mảng Promotion đang active
   */
  getActivePromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/active`);
  }

  /**
   * Tạo khuyến mãi mới
   * 
   * Endpoint: POST /api/promotions
   * 
   * Validation rules (backend):
   * - endDate >= startDate
   * - percent: 1-100
   * 
   * @param promotion - Thông tin khuyến mãi (không cần promotionID)
   * @returns Observable chứa Promotion đã tạo (có promotionID)
   */
  createPromotion(promotion: Promotion): Observable<Promotion> {
    return this.http.post<Promotion>(this.apiUrl, promotion);
  }

  /**
   * Cập nhật khuyến mãi
   * 
   * Endpoint: PUT /api/promotions/{id}
   * 
   * Cập nhật tất cả các trường của promotion
   * Validation rules giống createPromotion
   * 
   * @param id - ID của khuyến mãi cần cập nhật
   * @param promotion - Thông tin khuyến mãi mới
   * @returns Observable chứa Promotion đã cập nhật
   */
  updatePromotion(id: number, promotion: Promotion): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.apiUrl}/${id}`, promotion);
  }

  /**
   * Xóa khuyến mãi
   * 
   * Endpoint: DELETE /api/promotions/{id}
   * 
   * Xóa vĩnh viễn khỏi database
   * 
   * @param id - ID của khuyến mãi cần xóa
   * @returns Observable<void> (204 No Content khi thành công)
   */
  deletePromotion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Kiểm tra khuyến mãi có đang active không
   * 
   * Utility method - không gọi API
   * So sánh ngày hiện tại với startDate và endDate
   * 
   * @param promotion - Promotion cần kiểm tra
   * @returns true nếu promotion đang active, false nếu không
   */
  isPromotionActive(promotion: Promotion): boolean {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return now >= startDate && now <= endDate;
  }

  /**
   * Lấy trạng thái khuyến mãi
   * 
   * Utility method - không gọi API
   * Phân loại promotion dựa vào ngày hiện tại
   * 
   * Logic:
   * - upcoming: currentDate < startDate
   * - expired: currentDate > endDate
   * - active: startDate <= currentDate <= endDate
   * 
   * @param promotion - Promotion cần kiểm tra
   * @returns 'active' | 'expired' | 'upcoming'
   */
  getPromotionStatus(promotion: Promotion): 'active' | 'expired' | 'upcoming' {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (now < startDate) {
      return 'upcoming';
    } else if (now > endDate) {
      return 'expired';
    } else {
      return 'active';
    }
  }
}
