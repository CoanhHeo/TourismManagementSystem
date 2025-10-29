import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.travelvietnam.app',
  appName: 'Travel Tour Vietnam',
  webDir: 'dist/travel-frontend/browser',
  server: {
    // Allow cleartext (HTTP) traffic for development
    cleartext: true,
    // Use HTTP scheme instead of HTTPS for Android
    androidScheme: 'http'
  }
};

export default config;
