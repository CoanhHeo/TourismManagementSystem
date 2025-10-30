import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Tour } from '../../../shared/models/interfaces';
import { SqliteService } from '../sqlite.service';

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
 * - Offline support với SQLite cache
 * 
 * @Injectable providedIn: 'root' - Singleton service
 */
@Injectable({ providedIn: 'root' })
export class TourService {
  private base = `${environment.apiUrl}/tours`;
  
  constructor(
    private http: HttpClient,
    private sqlite: SqliteService
  ) {
    // Initialize SQLite database
    this.sqlite.initializeDatabase().catch(err => {
      console.warn('SQLite init failed, continuing without offline support:', err);
    });
  }
  
  /**
   * Lấy tất cả tours (với offline support)
   * 
   * @returns Observable<Tour[]>
   * 
   * Endpoint: GET /api/tours
   * 
   * Strategy:
   * 1. Thử gọi API online
   * 2. Nếu thành công → cache vào SQLite
   * 3. Nếu offline → load từ SQLite cache
   */
  getAll(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.base).pipe(
      tap(tours => {
        // Cache tours vào SQLite khi online
        this.sqlite.cacheTours(tours as any[]).then(() => {
          console.log('✅ Tours cached to SQLite');
        }).catch(err => {
          console.warn('⚠️ Failed to cache tours:', err);
        });
      }),
      catchError(error => {
        console.warn('❌ API call failed, loading from SQLite cache...', error);
        // Fallback to SQLite cache khi offline
        return from(this.sqlite.getCachedTours());
      })
    );
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
   * Lấy thông tin tour theo ID (với offline support)
   * 
   * @param id - ID của tour
   * @returns Observable<Tour>
   * 
   * Endpoint: GET /api/tours/{id}
   * 
   * Strategy:
   * 1. Thử gọi API online
   * 2. Nếu offline → tìm trong SQLite cache
   */
  getTourById(id: number): Observable<Tour> {
    return this.http.get<Tour>(`${this.base}/${id}`).pipe(
      catchError(error => {
        console.warn(`❌ API call failed for tour ${id}, loading from SQLite cache...`, error);
        // Fallback to SQLite cache
        return from(this.sqlite.getCachedTourById(id)).pipe(
          switchMap(tour => tour ? of(tour as Tour) : of({} as Tour))
        );
      })
    );
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

  /**
   * Lấy thông tin cache cho UI display
   * 
   * @returns Promise<{count: number; lastUpdate: string | null} | null>
   */
  async getCacheInfo(): Promise<{count: number; lastUpdate: string | null} | null> {
    try {
      return await this.sqlite.getCacheInfo();
    } catch (error) {
      console.warn('Failed to get cache info:', error);
      return null;
    }
  }

  /**
   * Xóa cache SQLite
   * 
   * @returns Promise<void>
   */
  async clearCache(): Promise<void> {
    try {
      await this.sqlite.clearCache();
      console.log('✅ SQLite cache cleared');
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
      throw error;
    }
  }
}