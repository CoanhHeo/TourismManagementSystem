import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * Interface cho Tour Guide
 */
export interface TourGuide {
  tourGuideID: number;
  userID: number;
  fullname: string;
  email: string;
  phone?: string;
  languages?: string;
  experience?: string;
  rating?: number;
  avatar?: string;
  status?: string;
}

/**
 * Service quản lý các API calls liên quan đến Tour Guides
 */
@Injectable({
  providedIn: 'root'
})
export class TourGuideService {
  private apiUrl = `${environment.apiUrl}/tour-guides`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy tất cả hướng dẫn viên
   * @returns Observable danh sách tour guides
   */
  getAllTourGuides(): Observable<TourGuide[]> {
    return this.http.get<TourGuide[]>(this.apiUrl);
  }

  /**
   * Lấy thông tin hướng dẫn viên theo ID
   * @param id ID hướng dẫn viên
   * @returns Observable thông tin tour guide
   */
  getTourGuideById(id: number): Observable<TourGuide> {
    return this.http.get<TourGuide>(`${this.apiUrl}/${id}`);
  }

  /**
   * Lấy danh sách hướng dẫn viên có sẵn (available)
   * @returns Observable danh sách tour guides có sẵn
   */
  getAvailableGuides(): Observable<TourGuide[]> {
    return this.http.get<TourGuide[]>(`${this.apiUrl}/available`);
  }

  /**
   * Lấy danh sách hướng dẫn viên đang hoạt động (Admin)
   * @returns Observable danh sách tour guides active
   */
  getActiveTourGuides(): Observable<TourGuide[]> {
    return this.http.get<TourGuide[]>(`${environment.apiUrl}/admin/tour-guides/active`);
  }

  /**
   * Lấy danh sách hướng dẫn viên có sẵn cho một tour departure cụ thể
   * @param departureId ID lịch khởi hành
   * @returns Observable danh sách tour guides có sẵn cho departure
   */
  getAvailableGuidesForDeparture(departureId: number): Observable<TourGuide[]> {
    return this.http.get<TourGuide[]>(`${this.apiUrl}/available/${departureId}`);
  }

  /**
   * Tạo hướng dẫn viên mới (Admin)
   * @param tourGuide Thông tin hướng dẫn viên
   * @returns Observable tour guide vừa tạo
   */
  createTourGuide(tourGuide: any): Observable<TourGuide> {
    return this.http.post<TourGuide>(this.apiUrl, tourGuide);
  }

  /**
   * Cập nhật thông tin hướng dẫn viên (Admin)
   * @param id ID hướng dẫn viên
   * @param tourGuide Thông tin cập nhật
   * @returns Observable tour guide sau khi cập nhật
   */
  updateTourGuide(id: number, tourGuide: any): Observable<TourGuide> {
    return this.http.put<TourGuide>(`${this.apiUrl}/${id}`, tourGuide);
  }

  /**
   * Xóa hướng dẫn viên (Admin)
   * @param id ID hướng dẫn viên
   * @returns Observable kết quả xóa
   */
  deleteTourGuide(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Phân công hướng dẫn viên cho lịch khởi hành
   * @param departureId ID lịch khởi hành
   * @param guideId ID hướng dẫn viên
   * @returns Observable kết quả phân công
   */
  assignGuide(departureId: number, guideId: number): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/tour-departures/${departureId}/assign-guide/${guideId}`, {});
  }

  /**
   * Hủy phân công hướng dẫn viên khỏi lịch khởi hành
   * @param departureId ID lịch khởi hành
   * @returns Observable kết quả hủy phân công
   */
  unassignGuide(departureId: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/tour-departures/${departureId}/unassign-guide`);
  }
}
