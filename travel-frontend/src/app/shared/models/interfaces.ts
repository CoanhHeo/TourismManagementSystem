/**
 * Shared interface definitions for the travel application
 */

export interface User {
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
  
  // Old schema fields (@deprecated - for backward compatibility)
  idKhachHang?: number;    // @deprecated - use userID
  tenKhachHang?: string;   // @deprecated - use fullname
  tuoi?: number;           // @deprecated - use age
  queQuan?: string;        // @deprecated - use address
  username?: string;
  password?: string;
  status?: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
}

// @deprecated - Use User instead
export interface KhachHang extends User {}

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
  bookingID?: number;      // Renamed from idDangKy
  idDangKy?: number;       // @deprecated - use bookingID
  idTour: number;
  userID?: number;         // New: use this for user reference
  idKhachHang?: number;    // @deprecated - use userID
  soLuong: number;
  bookingDate?: string;    // Renamed from ngayDangKy
  ngayDangKy?: string;     // @deprecated - use bookingDate
  dateCreated?: string;    // New field from backend
  tongGia?: number;
  tenTour?: string;
  userName?: string;       // New: use this for user name
  tenKhachHang?: string;   // @deprecated - use userName
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

export interface BookingRequest {
  idTour: number;
  userID?: number;         // New: use this for user ID
  idKhachHang?: number;    // @deprecated - use userID
  soLuong: number;
}

// @deprecated - Use BookingRequest instead
export interface DangKyRequest extends BookingRequest {}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  success?: boolean;
  user?: User; // For login response
}

export interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  timestamp: string;
  fieldErrors?: { [key: string]: string };
}

/**
 * Interface cho form thêm/sửa tour (dùng chung cho add-tour và edit-tour)
 */
export interface TourFormData {
  tourName: string;
  description: string;
  touristDestination: string;
  tourType: {
    tourTypeID: number;
  };
  promotion?: {
    promotionID: number;
  } | null;
}