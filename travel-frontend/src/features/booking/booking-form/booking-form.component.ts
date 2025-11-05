import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TourService } from '../../../app/core/services/api/tour.service';
import { BookingService } from '../../../app/core/services/api/booking.service';
import { UserService } from '../../../app/core/services/api/user.service';
import { AuthService } from '../../../app/core/services/api/auth.service';
import { User, Tour } from '../../../app/shared/models/interfaces';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit {
  tours: Tour[] = [];
  users: User[] = [];
  currentUser: User | null = null;
  form = { idTour: null as number | null, userID: null as number | null, soLuong: 1 };
  tongGia: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private tourSvc: TourService, 
    private bookingSvc: BookingService, 
    private userSvc: UserService,
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

    // Set the user ID to the logged-in user's ID
    this.form.userID = this.currentUser.userID || 0;

    this.tourSvc.getAll().subscribe({
      next: (r: Tour[]) => this.tours = r,
      error: () => this.error = 'Không lấy được danh sách tour. Kiểm tra backend.'
    });
    
    this.userSvc.getAll().subscribe({
      next: (r: User[]) => this.users = r,
      error: () => console.error('Không lấy được danh sách người dùng')
    });
  }

  submit() {
    this.error = null; this.tongGia = null; this.loading = true;
    const { idTour, userID, soLuong } = this.form;
    if (!idTour || !userID || !soLuong) { 
      this.error = 'Vui lòng điền đầy đủ thông tin';
      this.loading = false; 
      return; 
    }
    
    // Support both new and legacy field names
    this.bookingSvc.create({ 
      idTour, 
      idKhachHang: userID,  // Legacy field for backward compatibility
      soLuong 
    }).subscribe({
      next: res => { 
        this.tongGia = res.tongGia; 
        this.loading = false; 
      },
      error: e => { 
        console.error('Booking error:', e);
        this.error = e?.error?.message ?? 'Đặt tour thất bại'; 
        this.loading = false; 
      }
    });
  }

  logout() {
    this.authSvc.logout();
    this.router.navigate(['/login']);
  }
}