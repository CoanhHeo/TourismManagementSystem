# 📱 Hướng dẫn Capacitor - Chuyển Web sang Android App

## ✅ Đã hoàn thành Setup

### 1. Cài đặt Capacitor
```bash
npm install @capacitor/core@6 @capacitor/cli@6 @capacitor/android@6
```

### 2. Khởi tạo Capacitor
```bash
npx cap init "Travel Tour Vietnam" "com.travelvietnam.app" --web-dir=dist/travel-frontend/browser
```

**Thông tin app:**
- **App Name**: Travel Tour Vietnam
- **Package ID**: com.travelvietnam.app  
- **Web Dir**: dist/travel-frontend/browser

### 3. Thêm Android Platform
```bash
npx cap add android
```

### 4. Build Angular App
```bash
npm run build
```

### 5. Sync với Android
```bash
npx cap sync android
```

---

## 🚀 Workflow Phát Triển

### Mỗi lần thay đổi code Angular:

```bash
# 1. Build Angular app
npm run build

# 2. Sync changes sang Android
npx cap sync android

# 3. Open trong Android Studio (nếu cần)
npx cap open android
```

### Hoặc dùng live reload (khuyến nghị):

```bash
# Terminal 1: Chạy Angular dev server
npm start

# Terminal 2: Update capacitor config để point đến localhost
# Sau đó sync
npx cap sync android
npx cap open android
```

---

## 📁 Cấu trúc Project

```
travel-frontend/
├── android/                    # ← Android native project (mới)
│   ├── app/
│   │   └── src/main/
│   │       ├── assets/public/  # ← Web assets được copy vào đây
│   │       └── java/
│   ├── build.gradle
│   └── settings.gradle
├── capacitor.config.ts         # ← Capacitor configuration
├── dist/travel-frontend/browser/  # ← Built Angular app
└── src/                        # ← Angular source code
```

---

## 🔧 File Quan Trọng

### `capacitor.config.ts`
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.travelvietnam.app',
  appName: 'Travel Tour Vietnam',
  webDir: 'dist/travel-frontend/browser'
};

export default config;
```

### `.gitignore` (cần thêm)
```
# Capacitor
android/
ios/
```

---

## 📱 Chạy trên Android

### Yêu cầu:
- ✅ **Android Studio** đã cài đặt
- ✅ **JDK 17+** (Java Development Kit)
- ✅ **Android SDK** (API level 24+)
- ✅ **Android Emulator** hoặc **Device thật**

### Bước 1: Mở Android Studio
```bash
npx cap open android
```

### Bước 2: Trong Android Studio
1. Đợi Gradle sync xong
2. Chọn device/emulator
3. Click nút **Run** (▶️)

### Bước 3: App sẽ chạy trên Android!

---

## 🔌 Thêm Plugins hữu ích

### Camera Plugin
```bash
npm install @capacitor/camera
npx cap sync
```

**Sử dụng:**
```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

async takePicture() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri
  });
  // image.webPath chứa đường dẫn ảnh
}
```

### Geolocation Plugin  
```bash
npm install @capacitor/geolocation
npx cap sync
```

**Sử dụng:**
```typescript
import { Geolocation } from '@capacitor/geolocation';

async getCurrentPosition() {
  const coordinates = await Geolocation.getCurrentPosition();
  console.log('Lat:', coordinates.coords.latitude);
  console.log('Lng:', coordinates.coords.longitude);
}
```

### Storage Plugin (Local Storage)
```bash
npm install @capacitor/preferences
npx cap sync
```

**Sử dụng:**
```typescript
import { Preferences } from '@capacitor/preferences';

// Lưu
await Preferences.set({ key: 'name', value: 'John' });

// Lấy
const { value } = await Preferences.get({ key: 'name' });
```

### Share Plugin
```bash
npm install @capacitor/share
npx cap sync
```

**Sử dụng:**
```typescript
import { Share } from '@capacitor/share';

await Share.share({
  title: 'Tour Hạ Long Bay',
  text: 'Check out this amazing tour!',
  url: 'https://travelvietnam.app/tours/123',
  dialogTitle: 'Share with friends'
});
```

---

## ⚙️ Cấu hình Android

### AndroidManifest.xml

Nếu dùng Camera, Geolocation, cần thêm permissions:

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest>
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.INTERNET" />
</manifest>
```

### App Icon & Splash Screen

```bash
# Tạo icons và splash screens
npm install @capacitor/assets --save-dev
npx capacitor-assets generate
```

Đặt file nguồn vào:
- `resources/icon.png` (1024x1024)
- `resources/splash.png` (2732x2732)

---

## 🌐 API Server Configuration

### Development (Localhost)

Khi test trên emulator/device, không thể dùng `localhost`. Cần dùng IP:

**Cập nhật `environment.ts`:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://192.168.1.100:8080/api'  // ← Thay bằng IP máy bạn
};
```

**Tìm IP máy:**
```bash
# macOS
ifconfig | grep "inet "

# Windows
ipconfig
```

### Production

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.travelvietnam.com'
};
```

### Cho phép HTTP trong Android (Development)

Thêm vào `AndroidManifest.xml`:
```xml
<application
    android:usesCleartextTraffic="true">
    ...
</application>
```

---

## 🐛 Troubleshooting

### Lỗi: "The web assets directory must contain an index.html"
**Giải pháp:**
```bash
npm run build
npx cap sync android
```

### Lỗi: "CLEARTEXT communication not permitted"
**Giải pháp:** Thêm `android:usesCleartextTraffic="true"` vào AndroidManifest.xml

### Lỗi: "Failed to load resource: net::ERR_CLEARTEXT_NOT_PERMITTED"
**Giải pháp:** Cập nhật API URL từ http → https hoặc config cleartext

### App không load translation files
**Giải pháp:** 
- Kiểm tra `public/i18n/` folder có được copy vào dist không
- Build lại: `npm run build`
- Sync lại: `npx cap sync android`

### Gradle build failed
**Giải pháp:**
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

---

## 🚀 Build APK/AAB Production

### Debug APK (Test)
```bash
cd android
./gradlew assembleDebug
```
→ Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (Production)
```bash
cd android
./gradlew assembleRelease
```

### Release AAB (Google Play)
```bash
cd android
./gradlew bundleRelease
```
→ Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Ký APK/AAB

Tạo keystore:
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Cập nhật `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file("my-release-key.keystore")
            storePassword "password"
            keyAlias "my-key-alias"
            keyPassword "password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

---

## 📦 Deploy lên Google Play Store

1. **Tạo Google Play Console account**
2. **Build AAB**: `./gradlew bundleRelease`
3. **Upload AAB** lên Play Console
4. **Fill app info**: Screenshots, description, category
5. **Submit for review**

---

## 💡 Best Practices

### 1. Tách environment cho mobile
```typescript
// environment.mobile.ts
export const environment = {
  production: false,
  apiUrl: 'http://192.168.1.100:8080/api',
  platform: 'mobile'
};
```

### 2. Detect platform trong code
```typescript
import { Platform } from '@angular/cdk/platform';

constructor(private platform: Platform) {
  if (this.platform.ANDROID) {
    console.log('Running on Android');
  }
}
```

Hoặc dùng Capacitor:
```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  // Android-specific code
}
```

### 3. Handle back button trên Android
```typescript
import { App } from '@capacitor/app';

App.addListener('backButton', ({ canGoBack }) => {
  if (!canGoBack) {
    App.exitApp();
  } else {
    window.history.back();
  }
});
```

### 4. Status bar configuration
```bash
npm install @capacitor/status-bar
```

```typescript
import { StatusBar, Style } from '@capacitor/status-bar';

await StatusBar.setStyle({ style: Style.Dark });
await StatusBar.setBackgroundColor({ color: '#007bff' });
```

---

## 📊 Performance Tips

1. **Lazy loading**: Đã có trong Angular routing
2. **Image optimization**: Dùng WebP format
3. **Bundle size**: Monitor với `npm run build -- --stats-json`
4. **Network requests**: Cache API responses
5. **Offline support**: Implement Service Worker

---

## 🔗 Tài liệu Tham khảo

- [Capacitor Official Docs](https://capacitorjs.com/docs)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Android Studio Setup](https://developer.android.com/studio)

---

## 📝 Checklist Deploy

- [ ] Build Angular app: `npm run build`
- [ ] Sync Capacitor: `npx cap sync android`
- [ ] Update API URLs (production)
- [ ] Test trên emulator
- [ ] Test trên device thật
- [ ] Generate icons & splash screens
- [ ] Add permissions to AndroidManifest.xml
- [ ] Sign APK/AAB với keystore
- [ ] Test release build
- [ ] Upload lên Google Play Console
- [ ] Submit for review

---

**Version:** 1.0  
**Capacitor Version:** 6.x  
**Android Min SDK:** 24 (Android 7.0)  
**Target SDK:** 34 (Android 14)
