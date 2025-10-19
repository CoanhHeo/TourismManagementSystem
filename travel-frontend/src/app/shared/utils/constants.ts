/**
 * Application constants
 */
// danh sach 34 tinh sau sat nhap
export const VIETNAMESE_PROVINCES = [
  'Thành phố Hà Nội',
  'Thành phố Huế',
  'Tỉnh Lai Châu',
  'Tỉnh Điện Biên',
  'Tỉnh Sơn La',
  'Tỉnh Lạng Sơn',
  'Tỉnh Quảng Ninh',
  'Tỉnh Thanh Hoá',
  'Tỉnh Nghệ An',
  'Tỉnh Hà Tĩnh',
  'Tỉnh Cao Bằng',
  'Tỉnh Tuyên Quang',
  'Tỉnh Lào Cai',
  'Tỉnh Thái Nguyên',
  'Tỉnh Phú Thọ',
  'Tỉnh Bắc Ninh',
  'Tỉnh Hưng Yên',
  'Thành phố Hải Phòng',
  'Tỉnh Ninh Bình',
  'Tỉnh Quảng Trị',
  'Thành phố Đà Nẵng',
  'Tỉnh Quảng Ngãi',
  'Tỉnh Gia Lai',
  'Tỉnh Khánh Hoà',
  'Tỉnh Lâm Đồng',
  'Tỉnh Đắk Lắk',
  'Thành phố Hồ Chí Minh',
  'Tỉnh Đồng Nai',
  'Tỉnh Tây Ninh',
  'Thành phố Cần Thơ',
  'Tỉnh Vĩnh Long',
  'Tỉnh Đồng Tháp',
  'Tỉnh Cà Mau',
  'Tỉnh An Giang',
];

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 12,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
};

export const AGE_LIMITS = {
  MIN: 16,
  MAX: 100,
};

export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  RESEND_COOLDOWN_SECONDS: 60,
};

export const TOUR_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  FULL: 'FULL',
  CANCELLED: 'CANCELLED',
} as const;

export const CUSTOMER_STATUS = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'Trường này là bắt buộc',
  EMAIL_INVALID: 'Email không hợp lệ',
  PHONE_INVALID: 'Số điện thoại không hợp lệ',
  PASSWORD_WEAK: 'Mật khẩu quá yếu',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
  AGE_INVALID: 'Tuổi phải từ 16 đến 100',
  NAME_TOO_SHORT: 'Họ và tên phải có ít nhất 2 ký tự',
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    STATUS: '/auth/status',
  },
  TOURS: {
    GET_ALL: '/tour',
    GET_BY_ID: '/tour/{id}',
    SEARCH: '/tour/search',
  },
  CUSTOMERS: {
    GET_ALL: '/khachhang',
    GET_BY_ID: '/khachhang/{id}',
    CREATE: '/khachhang',
    UPDATE: '/khachhang/{id}',
    DELETE: '/khachhang/{id}',
    SEARCH: '/khachhang/search',
  },
  BOOKING: {
    CREATE: '/bookings',
    GET_BY_CUSTOMER: '/bookings/user/{id}',
    CANCEL: '/bookings/{id}/cancel',
  },
};
