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
}
