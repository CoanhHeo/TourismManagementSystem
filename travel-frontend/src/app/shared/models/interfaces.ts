/**
 * Shared interface definitions for the travel application
 */

export interface User {
  userID?: number;
  fullname?: string;
  email?: string;
  gender?: string;
  phoneNumber?: string;
  age?: number;
  address?: string;
  role?: string | {
    roleID: number;
    roleName: string;
  };
  dateCreated?: string;
  username?: string;
  password?: string;
  status?: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
}

export interface Tour {
  tourID?: number;
  tourName?: string;
  description?: string;
  touristDestination?: string;
  originalPrice?: number;
  totalBookings?: number;
  tourType?: {
    tourTypeID: number;
    tourTypeName: string;
  };
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
  bookingID?: number;
  tourID?: number;
  userID?: number;
  quantity?: number;
  bookingDate?: string;
  dateCreated?: string;
  totalPrice?: number;
  tourName?: string;
  userName?: string;
  tour?: Tour;
  tourDepartureID?: number;
  originalPrice?: number;
  departureLocation?: string;
  departureTime?: string;
  returnTime?: string;
  availableSlots?: number;
  status?: string;
}

export interface RegisterRequest {
  fullname: string;
  age: number | null;
  address: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  gender?: string;
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
  tourID?: number;
  userID?: number;
  quantity?: number;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  success?: boolean;
  user?: User;
}

export interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  timestamp: string;
  fieldErrors?: { [key: string]: string };
}

/**
 * Interface for add/edit tour form
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