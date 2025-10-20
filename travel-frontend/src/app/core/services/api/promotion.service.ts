import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Promotion {
  promotionID?: number;
  promotionName: string;
  percent: number;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
}

export interface PromotionStats {
  total: number;
  active: number;
  expired: number;
  upcoming: number;
}

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private apiUrl = `${environment.apiUrl}/promotions`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy tất cả khuyến mãi
   */
  getAllPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.apiUrl);
  }

  /**
   * Lấy khuyến mãi theo ID
   */
  getPromotionById(id: number): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiUrl}/${id}`);
  }

  /**
   * Lấy thống kê khuyến mãi
   */
  getPromotionStats(): Observable<PromotionStats> {
    return this.http.get<PromotionStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Lấy danh sách khuyến mãi đang active
   */
  getActivePromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/active`);
  }

  /**
   * Tạo khuyến mãi mới
   */
  createPromotion(promotion: Promotion): Observable<Promotion> {
    return this.http.post<Promotion>(this.apiUrl, promotion);
  }

  /**
   * Cập nhật khuyến mãi
   */
  updatePromotion(id: number, promotion: Promotion): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.apiUrl}/${id}`, promotion);
  }

  /**
   * Xóa khuyến mãi
   */
  deletePromotion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Kiểm tra khuyến mãi có đang active không
   */
  isPromotionActive(promotion: Promotion): boolean {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return now >= startDate && now <= endDate;
  }

  /**
   * Lấy trạng thái khuyến mãi
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
