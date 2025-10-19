import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Tour } from '../../../shared/models/interfaces';

@Injectable({ providedIn: 'root' })
export class TourService {
  private base = `${environment.apiUrl}/tours`; // Fixed: Changed from /tour to /tours
  
  constructor(private http: HttpClient) {}
  
  /**
   * Get all tours
   */
  getAll(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.base);
  }
  
  /**
   * Alias for getAll() for better readability
   */
  getTours(): Observable<Tour[]> {
    return this.getAll();
  }
  
  /**
   * Get a single tour by ID
   */
  getTourById(id: number): Observable<Tour> {
    return this.http.get<Tour>(`${this.base}/${id}`);
  }
}