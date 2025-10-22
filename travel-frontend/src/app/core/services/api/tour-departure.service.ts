import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TourDeparture } from '../../../shared/models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class TourDepartureService {
  private apiUrl = `${environment.apiUrl}/tour-departures`;

  constructor(private http: HttpClient) { }

  /**
   * Get all upcoming departures
   */
  getUpcomingDepartures(): Observable<TourDeparture[]> {
    return this.http.get<TourDeparture[]>(`${this.apiUrl}/upcoming`);
  }

  /**
   * Get upcoming departures for a specific tour
   */
  getUpcomingDeparturesByTour(tourID: number): Observable<TourDeparture[]> {
    return this.http.get<TourDeparture[]>(`${this.apiUrl}/tour/${tourID}/upcoming`);
  }

  /**
   * Get all departures for a specific tour
   */
  getDeparturesByTour(tourID: number): Observable<TourDeparture[]> {
    return this.http.get<TourDeparture[]>(`${this.apiUrl}/tour/${tourID}`);
  }

  /**
   * Get departure by ID with availability
   */
  getDepartureById(tourDepartureID: number): Observable<TourDeparture> {
    return this.http.get<TourDeparture>(`${this.apiUrl}/${tourDepartureID}`);
  }

  /**
   * Check if departure has available slots
   */
  checkAvailability(tourDepartureID: number, quantity: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${tourDepartureID}/check-availability`, {
      params: { quantity: quantity.toString() }
    });
  }

  /**
   * Lấy tất cả lịch khởi hành (Admin)
   * @returns Observable danh sách tất cả lịch khởi hành
   */
  getAllDepartures(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Tạo lịch khởi hành mới (Admin)
   * @param departure Thông tin lịch khởi hành
   * @returns Observable lịch khởi hành vừa tạo
   */
  createDeparture(departure: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, departure);
  }

  /**
   * Cập nhật lịch khởi hành (Admin)
   * @param id ID lịch khởi hành
   * @param departure Thông tin cập nhật
   * @returns Observable lịch khởi hành sau khi cập nhật
   */
  updateDeparture(id: number, departure: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, departure);
  }

  /**
   * Xóa lịch khởi hành (Admin)
   * @param id ID lịch khởi hành
   * @returns Observable kết quả xóa
   */
  deleteDeparture(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
