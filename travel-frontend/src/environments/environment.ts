import { Capacitor } from '@capacitor/core';

/**
 * Get API URL based on platform
 * - Web browser: localhost:8080
 * - Android emulator: 10.0.2.2:8080 (special IP for host machine)
 * - Real device: Use your machine's IP address
 */
function getApiUrl(): string {
  const platform = Capacitor.getPlatform();
  
  if (platform === 'web') {
    // Web browser
    return 'http://localhost:8080/api';
  } else {
    // Android/iOS - use 10.0.2.2 for emulator
    // For real device, replace with your machine IP like: http://192.168.1.100:8080/api
    return 'http://10.0.2.2:8080/api';
  }
}

export const environment = {
  production: false,
  apiUrl: getApiUrl()
};