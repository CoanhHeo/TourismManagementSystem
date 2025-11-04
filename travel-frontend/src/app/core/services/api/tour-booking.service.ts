import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TourBooking, ApiResponse } from '../../../shared/models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class TourBookingService {
  private baseUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  /**
   * Register for a tour
   */
  bookTour(booking: TourBooking): Observable<ApiResponse> {
    // Map old field names to new API format
    const bookingRequest = {
      userID: booking.idKhachHang,
      tourDepartureID: booking.tourDepartureID,
      quantity: booking.soLuong,
      promotionID: null
    };
    return this.http.post<ApiResponse>(this.baseUrl, bookingRequest);
  }

  /**
   * Check if tour has available seats
   */
  checkAvailability(idTour: number, soLuong: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/check-availability/${idTour}`, {
      params: { soLuong: soLuong.toString() }
    });
  }

  /**
   * Get total participants and available seats for a tour
   */
  getTourParticipants(idTour: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/participants/${idTour}`);
  }
}
