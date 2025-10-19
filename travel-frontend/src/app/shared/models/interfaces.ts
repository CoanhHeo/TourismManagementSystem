/**
 * Shared interface definitions for the travel application
 */

export interface KhachHang {
  // New backend User fields (from UserController)
  userID?: number;
  fullname?: string;
  email?: string;
  gender?: string;
  phoneNumber?: string;
  age?: number;
  address?: string;
  role?: string | {  // Allow both string and object formats
    roleID: number;
    roleName: string;
  };
  dateCreated?: string;
  
  // Old schema fields (for backward compatibility)
  idKhachHang?: number;
  tenKhachHang?: string;
  tuoi?: number;
  queQuan?: string;
  username?: string;
  password?: string;
  status?: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
}

export interface Tour {
  // New schema fields (matching backend)
  tourID?: number;
  tourName?: string;
  description?: string;
  touristDestination?: string;
  originalPrice?: number;  // New: from OriginalPrice column
  totalBookings?: number;  // Total number of bookings for popularity sorting
  tourType?: {
    tourTypeID: number;
    tourTypeName: string;
  };
  
  // Old schema fields (for backward compatibility)
  idTour?: number;
  tenTour?: string;
  giaTourGoc?: number;
  diaDiemTapTrung?: string;
  moTa?: string;
  thoiGian?: string;
  diaDiem?: string;
  hinhAnh?: string;
  soLuongKhach?: number;
  trangThai?: string;
  ngayKhoiHanh?: string;
  ngayKetThuc?: string;
  soChoConLai?: number;
  soChoToiDa?: number;
}

export interface TourDeparture {
  tourDepartureID: number;
  tourID: number;
  tourName?: string;
  touristDestination?: string;
  dayNum: number;
  originalPrice: number;
  departureLocation: string;
  departureTime: string;
  returnTime: string;
  maxQuantity: number;
  availableSlots?: number;
  promotion?: Promotion; // Active promotion for this tour
  tourGuide?: TourGuide; // Tour guide information
}

export interface TourGuide {
  tourGuideID: number;
  userID: number;
  fullname: string;
  email?: string;
  rating?: number;
  languages?: string;
}

export interface Promotion {
  promotionID: number;
  promotionName: string;
  percent: number;
  startDate: string;
  endDate: string;
}

export interface TourBooking {
  idDangKy?: number;
  idTour: number;
  idKhachHang: number;
  soLuong: number;
  ngayDangKy?: string;  // Old field - backward compatibility
  dateCreated?: string;  // New field from backend
  tongGia?: number;
  tenTour?: string;
  tenKhachHang?: string;
  tour?: Tour;
  tourDepartureID?: number;  // New: link to selected departure
  // Additional fields from backend response
  giaTourGoc?: number;
  diaDiemTapTrung?: string;
  ngayKhoiHanh?: string;
  ngayKetThuc?: string;
  soChoConLai?: number;
  trangThai?: string;
}

export interface RegisterRequest {
  fullname: string;      // Maps to backend UserRegistrationDto.fullname
  age: number | null;    // Maps to backend UserRegistrationDto.age
  address: string;       // Maps to backend UserRegistrationDto.address (queQuan)
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;  // Frontend only - not sent to backend
  acceptTerms: boolean;     // Frontend only - not sent to backend
  gender?: string;          // Optional - maps to backend UserRegistrationDto.gender
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpVerifyRequest {
  email: string;
  otpCode: string;
}

export interface DangKyRequest {
  idTour: number;
  idKhachHang: number;
  soLuong: number;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  success?: boolean;
  user?: KhachHang; // For login response
}

export interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  timestamp: string;
  fieldErrors?: { [key: string]: string };
}