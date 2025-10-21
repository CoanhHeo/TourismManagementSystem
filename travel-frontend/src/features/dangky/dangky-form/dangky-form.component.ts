import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TourService } from '../../../app/core/services/api/tour.service';
import { DangkyService } from '../../../app/core/services/api/dangky.service';
import { KhachHangService } from '../../../app/core/services/api/khachhang.service';
import { AuthService } from '../../../app/core/services/api/auth.service';
import { KhachHang, Tour } from '../../../app/shared/models/interfaces';

@Component({
  selector: 'app-dangky-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dangky-form.component.html',
  styleUrls: ['./dangky-form.component.css']
})
export class DangkyFormComponent implements OnInit {
  tours: Tour[] = [];
  khachHangs: KhachHang[] = [];
  currentUser: KhachHang | null = null;
  form = { idTour: null as number | null, idKhachHang: null as number | null, soLuong: 1 };
  tongGia: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private tourSvc: TourService, 
    private dkSvc: DangkyService, 
    private khSvc: KhachHangService,
    private authSvc: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    this.currentUser = this.authSvc.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Set the customer ID to the logged-in user's ID (handle both new and old field names)
    this.form.idKhachHang = this.currentUser.userID || this.currentUser.idKhachHang || 0;

    this.tourSvc.getAll().subscribe({
      next: r => this.tours = r,
      error: () => this.error = 'Không lấy được danh sách tour. Kiểm tra backend.'
    });
    
    this.khSvc.getAll().subscribe({
      next: r => this.khachHangs = r,
      error: () => console.error('Không lấy được danh sách khách hàng')
    });
  }

  submit() {
    this.error = null; this.tongGia = null; this.loading = true;
    const { idTour, idKhachHang, soLuong } = this.form;
    if (!idTour || !idKhachHang || !soLuong) { 
      this.error = 'Vui lòng điền đầy đủ thông tin';
      this.loading = false; 
      return; 
    }
    
    this.dkSvc.create({ idTour, idKhachHang, soLuong }).subscribe({
      next: res => { 
        this.tongGia = res.tongGia; 
        this.loading = false; 
      },
      error: e => { 
        console.error('Registration error:', e);
        this.error = e?.error?.message ?? 'Đăng ký thất bại'; 
        this.loading = false; 
      }
    });
  }

  logout() {
    this.authSvc.logout();
    this.router.navigate(['/login']);
  }
}