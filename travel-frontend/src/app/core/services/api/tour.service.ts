import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Tour } from '../../../shared/models/interfaces';

/**
 * Service xử lý các HTTP request liên quan đến Tour
 * 
 * Base URL: /api/tours
 * 
 * Features:
 * - CRUD operations cho tour
 * - Lấy danh sách tất cả tours
 * - Lấy tour theo ID
 * - Tạo, cập nhật, xóa tour
 * 
 * @Injectable providedIn: 'root' - Singleton service
 */
@Injectable({ providedIn: 'root' })
export class TourService {
  private base = `${environment.apiUrl}/tours`;
  
  constructor(private http: HttpClient) {}
  
  /**
   * Lấy tất cả tours
   * 
   * @returns Observable<Tour[]>
   * 
   * Endpoint: GET /api/tours
   */
  getAll(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.base);
  }
  
  /**
   * Alias cho getAll() để dễ đọc hơn
   * 
   * @returns Observable<Tour[]>
   */
  getTours(): Observable<Tour[]> {
    return this.getAll();
  }
  
  /**
   * Lấy thông tin tour theo ID
   * 
   * @param id - ID của tour
   * @returns Observable<Tour>
   * 
   * Endpoint: GET /api/tours/{id}
   */
  getTourById(id: number): Observable<Tour> {
    return this.http.get<Tour>(`${this.base}/${id}`);
  }

  /**
   * Tạo tour mới
   * 
   * @param tour - Thông tin tour cần tạo
   * @returns Observable<Tour>
   * 
   * Endpoint: POST /api/tours
   */
  createTour(tour: any): Observable<Tour> {
    return this.http.post<Tour>(this.base, tour);
  }

  /**
   * Cập nhật thông tin tour
   * 
   * @param id - ID của tour cần cập nhật
   * @param tour - Thông tin cập nhật
   * @returns Observable<Tour>
   * 
   * Endpoint: PUT /api/tours/{id}
   */
  updateTour(id: number, tour: any): Observable<Tour> {
    return this.http.put<Tour>(`${this.base}/${id}`, tour);
  }

  /**
   * Xóa tour
   * 
   * @param id - ID của tour cần xóa
   * @returns Observable<any>
   * 
   * Endpoint: DELETE /api/tours/{id}
   */
  deleteTour(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}