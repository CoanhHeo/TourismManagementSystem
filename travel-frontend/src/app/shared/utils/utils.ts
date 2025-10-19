/**
 * Shared utility functions for the travel application
 */

export class ValidationUtils {
  
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate Vietnamese phone number
   */
  static isValidVietnamesePhone(phone: string): boolean {
    if (!phone) return false;
    const phoneRegex = /^(\+84|0)[3-9][0-9]{8}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Mật khẩu không được để trống');
      return { isValid: false, strength: 'weak', errors };
    }

    if (password.length < 8) {
      errors.push('Mật khẩu phải có ít nhất 8 ký tự');
    }

    if (password.length > 12) {
      errors.push('Mật khẩu không được vượt quá 12 ký tự');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
    }

    if (!/\d/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ số');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
    }

    // Calculate strength
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 5 && errors.length === 0) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return {
      isValid: errors.length === 0,
      strength,
      errors
    };
  }

  /**
   * Validate age
   */
  static isValidAge(age: number | null): boolean {
    return age !== null && age >= 16 && age <= 100;
  }

  /**
   * Validate name
   */
  static isValidName(name: string): boolean {
    return !!(name && name.trim().length >= 2);
  }
}

export class FormatUtils {
  
  /**
   * Format currency (VND)
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Format phone number for display
   */
  static formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    // Format: 0987654321 -> 098 765 4321
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }

  /**
   * Mask sensitive information
   */
  static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) return email;
    return localPart.substring(0, 2) + '****@' + domain;
  }

  static maskPhone(phone: string): string {
    if (!phone || phone.length < 4) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(phone.length - 3);
  }

  /**
   * Generate random string for IDs
   */
  static generateId(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export class DateUtils {
  
  /**
   * Format date to Vietnamese format
   */
  static formatVietnameseDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Time ago function
   */
  static timeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
    return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
  }
}