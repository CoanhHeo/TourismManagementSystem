import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { KhachHang } from '../../../shared/models/interfaces';

@Injectable({ providedIn: 'root' })
export class KhachHangService {
  private base = `${environment.apiUrl}/khachhang`;
  constructor(private http: HttpClient) {}
  getAll() { return this.http.get<KhachHang[]>(this.base); }
}