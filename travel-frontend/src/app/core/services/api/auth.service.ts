import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { 
  KhachHang, 
  RegisterRequest, 
  LoginRequest, 
  OtpVerifyRequest, 
  ApiResponse 
} from '../../../shared/models/interfaces';
import { API_ENDPOINTS } from '../../../shared/utils/constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/users`;
  private currentUserSubject = new BehaviorSubject<KhachHang | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user from localStorage on service init
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  register(data: RegisterRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/register`, data);
  }

  verifyOtp(data: OtpVerifyRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/verify-otp`, data);
  }

  resendOtp(email: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/resend-otp`, { email });
  }

  login(data: LoginRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/login`, data).pipe(
      tap((response: any) => {
        // Handle the backend response structure
        // Backend returns user data in response.user
        if (response.success && response.user) {
          const user = response.user;
          // Save user to localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          // Update current user subject
          this.currentUserSubject.next(user);
          console.log('User session saved:', user);
        }
      })
    );
  }

  logout(): void {
    // Clear local storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('userEmail');
    
    // Clear current user state
    this.currentUserSubject.next(null);
    
    console.log('User successfully logged out');
  }

  getCurrentUser(): KhachHang | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }
}