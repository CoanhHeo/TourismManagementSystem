import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * Interface cho Tour Type
 */
export interface TourType {
  tourTypeID?: number;
  tourTypeName: string;
}

/**
 * Service quản lý Tour Type
 * 
 * Chức năng:
 * - Lấy danh sách tất cả loại tour
 * - Lấy chi tiết loại tour
 * - Tạo mới loại tour
 * - Cập nhật loại tour
 * - Xóa loại tour
 */
@Injectable({
  providedIn: 'root'
})
export class TourTypeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tour-types`;

  /**
   * Lấy tất cả loại tour
   * 
   * @returns Observable<TourType[]>
   */
  getAllTourTypes(): Observable<TourType[]> {
    return this.http.get<TourType[]>(this.apiUrl);
  }

  /**
   * Lấy loại tour theo ID
   * 
   * @param id - ID của loại tour
   * @returns Observable<TourType>
   */
  getTourTypeById(id: number): Observable<TourType> {
    return this.http.get<TourType>(`${this.apiUrl}/${id}`);
  }

  /**
   * Tạo mới loại tour
   * 
   * @param tourType - Thông tin loại tour cần tạo
   * @returns Observable<TourType>
   */
  createTourType(tourType: TourType): Observable<TourType> {
    return this.http.post<TourType>(this.apiUrl, tourType);
  }

  /**
   * Cập nhật loại tour
   * 
   * @param id - ID của loại tour
   * @param tourType - Thông tin cập nhật
   * @returns Observable<TourType>
   */
  updateTourType(id: number, tourType: TourType): Observable<TourType> {
    return this.http.put<TourType>(`${this.apiUrl}/${id}`, tourType);
  }

  /**
   * Xóa loại tour
   * 
   * @param id - ID của loại tour cần xóa
   * @returns Observable<any>
   */
  deleteTourType(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
