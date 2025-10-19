import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { TourBooking } from '../../../shared/models/interfaces';

export interface DangKyRequest { 
  idTour: number; 
  idKhachHang: number; 
  soLuong: number; 
}

export interface CustomerBookingsResponse {
  success: boolean;
  data: TourBooking[];
  total: number;
}

export interface BookingDetailResponse {
  success: boolean;
  data: TourBooking;
}

@Injectable({ providedIn: 'root' })
export class DangkyService {
  private base = `${environment.apiUrl}/bookings`;  // Changed from /dangky to /bookings
  
  constructor(private http: HttpClient) {}
  
  create(payload: DangKyRequest) {
    // Map old field names to new API format
    const bookingRequest = {
      userID: payload.idKhachHang,
      tourDepartureID: payload.idTour,
      quantity: payload.soLuong,
      promotionID: null
    };
    return this.http.post<any>(this.base, bookingRequest).pipe(
      map(response => ({ tongGia: 0 })) // Legacy response format
    );
  }
  
  /**
   * Get all bookings for a customer
   */
  getCustomerBookings(customerId: number): Observable<any> {
    return this.http.get<any>(`${this.base}/user/${customerId}`).pipe(
      map(bookings => ({
        success: true,
        data: bookings,
        total: bookings.length
      }))
    );
  }
  
  /**
   * Get booking details by ID
   */
  getBookingById(bookingId: number): Observable<BookingDetailResponse> {
    return this.http.get<BookingDetailResponse>(`${this.base}/${bookingId}`);
  }
}