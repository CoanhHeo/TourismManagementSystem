# 🌴 Hệ Thống Quản Lý Du Lịch - Tourism Management System

Nền tảng đặt tour du lịch hiện đại, full-stack với **Spring Boot 3**, **Angular 18**, và **Capacitor 6** - hỗ trợ cả Web và Mobile Android.

## 🌟 **Tính Năng Chính**

### **🔐 Hệ Thống Xác Thực & Phân Quyền**
- ✅ Đăng ký tài khoản với validation đầy đủ
- ✅ Đăng nhập với email/username và password
- ✅ Quản lý phiên đăng nhập (Session-based)
- ✅ Yêu cầu mật khẩu mạnh (BCrypt hashing)
- ✅ Phân quyền theo vai trò: Customer, Tour Guide, Admin
- ✅ Giao diện đăng nhập/đăng ký hiện đại

### **� Đa Ngôn Ngữ (i18n)**
- ✅ Hỗ trợ Tiếng Việt 🇻🇳 và English 🇬🇧
- ✅ Chuyển đổi ngôn ngữ realtime (không reload page)
- ✅ Lưu ngôn ngữ vào localStorage
- ✅ 100% UI đã được i18n hóa
- ✅ Dễ mở rộng sang ngôn ngữ khác

### **📱 Mobile App (Android)**
- ✅ Build APK từ Angular app với Capacitor
- ✅ Native Android app với WebView
- ✅ SQLite offline support
- ✅ Cache tour data tự động
- ✅ Hoạt động offline (xem tours đã cache)
- ✅ Sync data khi online
- ✅ Search tours trong cache offline

### **�🎫 Quản Lý Tour Du Lịch**
- ✅ Danh sách tour chuyên nghiệp với tìm kiếm
- ✅ Hiển thị dạng lưới và danh sách
- ✅ Lọc theo loại tour, địa điểm
- ✅ Thẻ tour responsive với hình ảnh
- ✅ Thông tin chi tiết tour
- ✅ Quản lý chuyến khởi hành (Tour Departure)
- ✅ Admin: CRUD tours đầy đủ
- ✅ Offline viewing (Mobile)

### **💰 Hệ Thống Khuyến Mãi**
- ✅ Quản lý khuyến mãi (Admin)
- ✅ Thống kê khuyến mãi (Total, Active, Expired, Upcoming)
- ✅ Áp dụng khuyến mãi cho tour
- ✅ Validation thời gian và phần trăm giảm giá
- ✅ Giao diện quản lý với glassmorphic design

### **📝 Hệ Thống Đặt Tour**
- ✅ Đăng ký tour cho khách hàng
- ✅ Quản lý thông tin khách hàng
- ✅ Tính toán giá tour (có áp dụng khuyến mãi)
- ✅ Theo dõi số lượng chỗ còn trống
- ✅ Xác nhận thanh toán

### **🧭 Quản Lý Hướng Dẫn Viên**
- ✅ Tour Guide Dashboard
- ✅ Xem chuyến đi được phân công
- ✅ Danh sách hành khách theo chuyến
- ✅ Lọc chuyến đi (upcoming, current, active)
- ✅ Thống kê hành khách

### **⚙️ Admin Dashboard**
- ✅ Quản lý người dùng (CRUD)
- ✅ Quản lý tours (CRUD)
- ✅ Quản lý chuyến khởi hành
- ✅ Quản lý khuyến mãi (CRUD)
- ✅ Phân quyền tour guide
- ✅ Thống kê tổng quan

## 📁 **Cấu Trúc Dự Án**

```
QuanLyDuLich/
├── travel-backend/                    # Spring Boot 3.5.6 Backend
│   └── src/main/java/com/example/travel/
│       ├── TravelApplication.java     # Entry point
│       ├── config/                    # Cấu hình
│       │   ├── ApplicationConfig.java # Bean configurations
│       │   └── WebConfig.java         # CORS, WebMVC config
│       ├── controller/                # REST Controllers
│       │   ├── UserController.java    # Xác thực & User management
│       │   ├── TourController.java    # Quản lý tours
│       │   ├── TourTypeController.java      # Loại tour
│       │   ├── TourDepartureController.java # Chuyến khởi hành
│       │   ├── PromotionController.java     # Khuyến mãi
│       │   ├── BookingController.java       # Đặt tour
│       │   ├── TourGuideController.java     # Tour Guide
│       │   ├── AdminController.java         # Admin
│       │   └── AdminTourGuideController.java # Admin quản lý TG
│       ├── dto/                       # Data Transfer Objects
│       │   ├── PromotionDTO.java      # Promotion DTO
│       │   ├── PromotionStatsDTO.java # Promotion statistics
│       │   ├── TourWithPriceDTO.java  # Tour với giá
│       │   └── BookingResponseDto.java
│       ├── entity/                    # JPA Entities
│       │   ├── User.java              # Người dùng
│       │   ├── Role.java              # Vai trò
│       │   ├── Tour.java              # Tour du lịch
│       │   ├── TourType.java          # Loại tour
│       │   ├── TourDeparture.java     # Chuyến khởi hành
│       │   ├── Promotion.java         # Khuyến mãi
│       │   ├── Booking.java           # Đặt tour
│       │   └── TourGuide.java         # Hướng dẫn viên
│       ├── repository/                # Data Access Layer
│       │   ├── UserRepository.java
│       │   ├── TourRepository.java
│       │   ├── TourDepartureRepository.java
│       │   ├── PromotionRepository.java
│       │   ├── BookingRepository.java
│       │   └── TourGuideRepository.java
│       └── service/                   # Business Logic
│           ├── UserService.java       # User service
│           ├── TourGuideService.java  # Tour guide logic
│           ├── PromotionService.java  # Promotion logic
│           ├── BookingService.java    # Booking logic
│           └── TourDepartureService.java
└── travel-frontend/                   # Angular 18 Frontend
    └── src/
        ├── app/
        │   ├── core/                  # Core modules
        │   │   ├── guards/            # Route guards
        │   │   │   └── admin.guard.ts # Admin protection
        │   │   └── services/api/      # HTTP services
        │   │       ├── auth.service.ts
        │   │       ├── tour.service.ts
        │   │       ├── promotion.service.ts
        │   │       └── booking.service.ts
        │   ├── shared/                # Shared resources
        │   │   ├── components/        # Reusable components
        │   │   │   ├── loading-spinner.component.ts
        │   │   │   └── toast-notification.component.ts
        │   │   ├── models/            # TypeScript interfaces
        │   │   │   └── interfaces.ts
        │   │   ├── services/          # Shared services
        │   │   │   └── toast.service.ts
        │   │   └── utils/             # Utilities
        │   │       ├── utils.ts
        │   │       └── constants.ts
        │   ├── features/              # Feature modules
        │   │   ├── auth/              # Authentication
        │   │   │   ├── login/
        │   │   │   └── register/
        │   │   ├── tour/              # Tour features
        │   │   │   ├── tour-list/
        │   │   │   ├── tour-booking/
        │   │   │   └── my-bookings/
        │   │   ├── admin/             # Admin features
        │   │   │   ├── admin-dashboard/
        │   │   │   ├── admin-promotions/  # NEW: Quản lý KM
        │   │   │   ├── add-tour/
        │   │   │   └── add-tour-departure/
        │   │   └── booking/            # Booking/registration features
        │   ├── app.component.ts       # Root component
        │   ├── app.config.ts          # App configuration
        │   └── app.routes.ts          # Routing
        └── environments/              # Environment configs
            └── environment.ts         # API endpoints

```

## 🏗️ **Kiến Trúc Hệ Thống**

### **Backend (Spring Boot 3.5.6)**

#### **1. Kiến Trúc Phân Lớp (Layered Architecture)**
- **Controller Layer**: REST API endpoints với HTTP status codes chuẩn
- **Service Layer**: Business logic và transaction management
- **Repository Layer**: Data access với Spring Data JPA
- **Entity Layer**: Database models với relationships đầy đủ
- **DTO Layer**: API contracts tách biệt khỏi entities

#### **2. Nguyên Tắc Thiết Kế**
- ✅ **Separation of Concerns**: Tách biệt rõ ràng các layer
- ✅ **Dependency Injection**: Constructor-based injection
- ✅ **Exception Handling**: Global exception handler
- ✅ **Validation**: Bean Validation (JSR-303) + custom validators
- ✅ **CORS Configuration**: Cấu hình cross-origin hợp lý
- ✅ **Documentation**: JavaDoc comments đầy đủ bằng tiếng Việt

#### **3. Database Design**
- **RDBMS**: SQL Server
- **ORM**: Hibernate/JPA
- **Relationships**: 
  - User ↔ Role (Many-to-One)
  - Tour ↔ TourType (Many-to-One)
  - Tour ↔ Promotion (Many-to-One, Optional)
  - Tour ↔ TourDeparture (One-to-Many)
  - TourDeparture ↔ Booking (One-to-Many)
  - TourDeparture ↔ TourGuide (Many-to-One)
  - User ↔ Booking (One-to-Many)

### **Frontend (Angular 18)**

#### **1. Kiến Trúc Feature-Based**
- **Core Module**: Singleton services, guards, interceptors
- **Shared Module**: Reusable components và utilities
- **Feature Modules**: Các modules nghiệp vụ độc lập
- **Standalone Components**: Modern Angular 18 approach

#### **2. State Management**
- ✅ **Signals**: Angular Signals cho reactive state
- ✅ **RxJS Observables**: Async operations và data streams
- ✅ **BehaviorSubject**: Simple state management
- ✅ **LocalStorage**: Persist user session

#### **3. UI/UX Design Patterns**
- 🎨 **Modern Design**: Gradient backgrounds, glassmorphic effects
- 📱 **Responsive**: Mobile-first, breakpoints chuẩn
- ⚡ **Performance**: Lazy loading, optimized bundles
- 🔐 **Security**: Form validation, XSS protection
- ♿ **Accessibility**: Semantic HTML, ARIA labels

## 🛠️ **Tech Stack Chi Tiết**

### **Backend Technologies**
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Spring Boot | 3.5.6 |
| Language | Java | 17+ |
| Database | SQL Server | 2019+ |
| ORM | Spring Data JPA | 3.x |
| Validation | Bean Validation | JSR-303 |
| Build Tool | Maven | 3.8+ |

### **Frontend Technologies**
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Angular | 18 |
| Language | TypeScript | 5.x |
| HTTP Client | Angular HttpClient | - |
| Routing | Angular Router | - |
| Forms | Reactive Forms | - |
| State | Signals + RxJS | - |
| i18n | ngx-translate | 17.0.0 |

### **Mobile Technologies**
| Component | Technology | Version |
|-----------|-----------|---------|
| Mobile Framework | Capacitor | 6.0.3 |
| Platform | Android | - |
| Offline Database | SQLite | 6.0.1 |
| Local Storage | Capacitor Preferences | - |
| Build Tool | Gradle | 8.2.1 |

## 📋 **API Documentation**

### **Authentication & Users (`/api/users`)**
```http
POST   /register              # Đăng ký tài khoản
POST   /login                 # Đăng nhập
POST   /logout                # Đăng xuất
GET    /profile/{id}          # Lấy thông tin user
PUT    /profile/{id}          # Cập nhật profile
```

### **Tours (`/api/tours`)**
```http
GET    /                      # Lấy tất cả tours (với giá min)
GET    /{id}                  # Lấy tour theo ID
GET    /type/{tourTypeID}     # Lấy tours theo loại
GET    /search/destination    # Tìm theo địa điểm (?q=keyword)
GET    /search                # Tìm theo tên/mô tả (?q=keyword)
POST   /                      # Tạo tour mới (Admin)
PUT    /{id}                  # Cập nhật tour (Admin)
DELETE /{id}                  # Xóa tour (Admin)
```

### **Tour Types (`/api/tour-types`)**
```http
GET    /                      # Lấy tất cả loại tour
```

### **Tour Departures (`/api/tour-departures`)**
```http
GET    /                      # Lấy tất cả departures (Admin)
GET    /upcoming              # Lấy chuyến sắp diễn ra
GET    /tour/{tourId}         # Lấy departures của tour
GET    /{id}                  # Lấy departure theo ID
POST   /check-availability    # Kiểm tra chỗ trống
POST   /                      # Tạo departure (Admin)
PUT    /{id}                  # Cập nhật departure (Admin)
DELETE /{id}                  # Xóa departure (Admin)
```

### **Promotions (`/api/promotions`)**
```http
GET    /                      # Lấy tất cả khuyến mãi
GET    /{id}                  # Lấy khuyến mãi theo ID
GET    /active                # Lấy KM đang active
GET    /stats                 # Lấy thống kê KM
POST   /                      # Tạo khuyến mãi (Admin)
PUT    /{id}                  # Cập nhật KM (Admin)
DELETE /{id}                  # Xóa KM (Admin)
```

### **Bookings (`/api/bookings`)**
```http
POST   /                      # Tạo booking mới
GET    /user/{userId}         # Lấy bookings của user
PUT    /{id}/payment-status   # Cập nhật trạng thái thanh toán
```

### **Tour Guide (`/api/tour-guide`)**
```http
GET    /my-departures              # Chuyến đi được phân công
GET    /upcoming-departures        # Chuyến sắp diễn ra
GET    /departure/{id}/passengers  # Danh sách hành khách
```

### **Admin (`/api/admin`)**
```http
GET    /users                 # Lấy tất cả users
GET    /users/{roleId}        # Lấy users theo role
DELETE /users/{id}            # Xóa user
POST   /users                 # Tạo user mới
GET    /dashboard             # Thống kê dashboard
```

### **Admin - Tour Guides (`/api/admin/tour-guides`)**
```http
GET    /active                # Lấy danh sách tour guides active
```

## 🔧 **Hướng Dẫn Cài Đặt & Chạy**

### **Yêu Cầu Hệ Thống**
- ☕ Java JDK 17 trở lên
- 📦 Node.js 18+ và npm
- 🗄️ SQL Server 2019+
- 🔨 Maven 3.8+
- 💻 Visual Studio Code hoặc IntelliJ IDEA

### **Cài Đặt Database**
1. Tạo database mới trong SQL Server:
```sql
CREATE DATABASE TourismDB;
```

2. Import SQL script từ file `SQLQuery_QLDL_Fix18102025.sql`

3. Cấu hình connection trong `application.properties`:
```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=TourismDB
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### **Chạy Backend**
```bash
cd travel-backend

# Build project
./mvnw clean install

# Chạy application
./mvnw spring-boot:run

# Hoặc chạy JAR file
java -jar target/ql-dulich-api-0.0.1-SNAPSHOT.jar
```

Backend sẽ chạy tại: **http://localhost:8080**

### **Chạy Frontend**
```bash
cd travel-frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm start

# Hoặc
ng serve
```

Frontend sẽ chạy tại: **http://localhost:4200**

### **Build Production**
```bash
# Backend
cd travel-backend
./mvnw clean package -DskipTests

# Frontend
cd travel-frontend
npm run build
# Output: dist/travel-frontend/
```

## 📊 **Chất Lượng Code**

### **Backend**
- ✅ Exception handling đầy đủ với custom exceptions
- ✅ Input validation với Bean Validation
- ✅ API response structure nhất quán
- ✅ Tách biệt DTOs và Entities
- ✅ Transaction management (@Transactional)
- ✅ JavaDoc comments bằng tiếng Việt
- ✅ BigDecimal cho tính toán tiền chính xác
- ✅ LocalDate/LocalDateTime cho xử lý ngày tháng

### **Frontend**
- ✅ Strong TypeScript typing
- ✅ Reusable component library
- ✅ Centralized constants và utilities
- ✅ Consistent error handling
- ✅ Modern CSS architecture (Flexbox, Grid)
- ✅ Responsive design (Mobile-first)
- ✅ Angular Signals cho reactive state
- ✅ JSDoc comments cho TypeScript code

### **Security**
- ✅ CORS configuration hợp lý
- ✅ Input validation cả frontend lẫn backend
- ✅ Password requirements
- ✅ SQL injection prevention (JPA/Hibernate)
- ✅ XSS protection

## 🎨 **UI/UX Highlights**

### **Design System**
- **Color Palette**: 
  - Primary: Purple gradient (#667eea → #764ba2)
  - Success: Green (#10b981)
  - Warning: Orange (#f59e0b)
  - Error: Red (#ef4444)
- **Typography**: System fonts, clear hierarchy
- **Components**: Cards, buttons, forms, modals
- **Effects**: Glassmorphic, shadows, transitions

### **Responsive Breakpoints**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔐 **User Roles & Permissions**

### **Customer (RoleID = 2)**
- Xem danh sách tours
- Tìm kiếm tours
- Đặt tour
- Xem bookings của mình
- Cập nhật profile

### **Tour Guide (RoleID = 3)**
- Xem chuyến đi được phân công
- Xem danh sách hành khách
- Xem thông tin tour
- Cập nhật profile

### **Admin (RoleID = 1)**
- **Tất cả quyền của Customer & Tour Guide**
- Quản lý Users (CRUD)
- Quản lý Tours (CRUD)
- Quản lý Tour Departures (CRUD)
- Quản lý Promotions (CRUD)
- Phân quyền Tour Guide
- Xem thống kê dashboard

## 📈 **Business Logic Highlights**

### **Promotion System**
- **Validation Rules**:
  - Percent: 1-100 (BigDecimal)
  - EndDate >= StartDate
  - Tên khuyến mãi không trống
- **Status Calculation**:
  - Active: currentDate ∈ [startDate, endDate]
  - Expired: currentDate > endDate
  - Upcoming: currentDate < startDate
- **Application**:
  - 1 Promotion → Many Tours (One-to-Many)
  - 1 Tour → 0 or 1 Promotion (Optional)

### **Booking System**
- **Capacity Check**: currentPassengers < maxQuantity
- **Price Calculation**: 
  - Base: originalPrice × numberOfPassengers
  - With Promotion: base × (1 - percent/100)
- **Status Flow**: PENDING → PAID → CANCELLED

### **Tour Departure**
- **Date Validation**: departureTime < returnTime
- **Capacity Management**: Track available slots
- **Guide Assignment**: Optional TourGuide
- **Price Flexibility**: Each departure có giá riêng

## 🎯 **Tính Năng Đã Hoàn Thành**

### ✅ **Phase 1: Core Features**
- [x] Authentication & Authorization
- [x] User Management
- [x] Tour CRUD
- [x] Tour Type Management
- [x] Tour Departure Management
- [x] Booking System
- [x] Tour Guide Dashboard

### ✅ **Phase 2: Advanced Features**
- [x] Promotion Management System
- [x] Promotion Statistics
- [x] Apply Promotion to Tours
- [x] Admin Dashboard
- [x] Responsive UI Design
- [x] Loading States & Error Handling
- [x] Toast Notifications

### ✅ **Phase 3: Code Quality**
- [x] Clean Code & Refactoring
- [x] Vietnamese Comments
- [x] Remove Unused Code
- [x] Suppress Warnings
- [x] Comprehensive Documentation

## 🚀 **Roadmap - Tính Năng Tương Lai**

### **Short Term (1-3 tháng)**
- [ ] JWT Authentication thay session
- [ ] Role-based Route Guards
- [ ] Email Service (SendGrid/Mailgun)
- [ ] Payment Integration (VNPay/Momo)
- [ ] File Upload (Tour images)
- [ ] Advanced Search Filters
- [ ] Tour Reviews & Ratings

### **Medium Term (3-6 tháng)**
- [ ] Real-time Notifications (WebSocket)
- [ ] Chat Support System
- [ ] Report & Analytics Dashboard
- [ ] Export Data (Excel/PDF)
- [ ] Multi-language Support (i18n)
- [ ] Mobile App (React Native/Flutter)

### **Long Term (6-12 tháng)**
- [ ] Microservices Architecture
- [ ] Docker Containerization
- [ ] Kubernetes Orchestration
- [ ] CI/CD Pipeline (GitHub Actions)
- [ ] Automated Testing (Unit, Integration, E2E)
- [ ] Performance Monitoring (New Relic/Datadog)
- [ ] CDN Integration
- [ ] A/B Testing Framework

## 📝 **Development Guidelines**

### **Backend (Java/Spring Boot)**
```java
// ✅ GOOD: Sử dụng DTOs
public ResponseEntity<PromotionDTO> getPromotion(Integer id) {
    return ResponseEntity.ok(promotionService.getPromotionById(id));
}

// ❌ BAD: Trả về Entity trực tiếp
public ResponseEntity<Promotion> getPromotion(Integer id) {
    return ResponseEntity.ok(promotionRepository.findById(id).get());
}

// ✅ GOOD: Comments tiếng Việt
/**
 * Lấy danh sách khuyến mãi đang active
 * 
 * @return List<PromotionDTO> đang hoạt động
 */

// ✅ GOOD: Exception handling
try {
    // business logic
} catch (RuntimeException e) {
    return ResponseEntity.badRequest().body(e.getMessage());
}
```

### **Frontend (TypeScript/Angular)**
```typescript
// ✅ GOOD: Strong typing
interface Promotion {
  promotionID?: number;
  promotionName: string;
  percent: number;
}

// ✅ GOOD: Signals cho reactive state
promotions = signal<Promotion[]>([]);
stats = signal({ total: 0, active: 0, expired: 0, upcoming: 0 });

// ✅ GOOD: Error handling
this.service.getPromotions().subscribe({
  next: (data) => this.promotions.set(data),
  error: (err) => this.toastService.show('Lỗi tải dữ liệu', 'error')
});

// ✅ GOOD: JSDoc comments
/**
 * Lấy tất cả khuyến mãi từ backend
 * 
 * @returns Observable<Promotion[]>
 */
getAllPromotions(): Observable<Promotion[]> {
  return this.http.get<Promotion[]>(this.apiUrl);
}
```

### **CSS Best Practices**
```css
/* ✅ GOOD: BEM naming */
.promotion-card { }
.promotion-card__header { }
.promotion-card__title { }
.promotion-card--active { }

/* ✅ GOOD: CSS Variables */
:root {
  --primary-color: #667eea;
  --success-color: #10b981;
  --border-radius: 12px;
}

/* ✅ GOOD: Mobile-first responsive */
.container {
  /* Mobile styles */
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    /* Tablet/Desktop styles */
    padding: 2rem;
  }
}
```

## 🧪 **Testing**

### **Backend Testing** (Planned)
```bash
# Unit Tests
./mvnw test

# Integration Tests
./mvnw verify

# Code Coverage
./mvnw jacoco:report
```

### **Frontend Testing** (Planned)
```bash
# Unit Tests
ng test

# E2E Tests
ng e2e

# Code Coverage
ng test --code-coverage
```

## � **Mobile App Development**

### **Khởi Tạo Dự Án Mobile**
```bash
# Cài đặt Capacitor
cd travel-frontend
npm install @capacitor/core @capacitor/cli
npx cap init

# Thêm platform Android
npm install @capacitor/android
npx cap add android

# Cài đặt SQLite plugin
npm install @capacitor-community/sqlite
npx cap sync
```

### **Cấu Hình Android**

**capacitor.config.ts:**
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.travelvietnam.app',
  appName: 'Travel Vietnam',
  webDir: 'dist/travel-frontend/browser',
  server: {
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;
```

**AndroidManifest.xml:** Thêm quyền truy cập internet và network:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<application android:usesCleartextTraffic="true">
```

### **SQLite Offline Database**

**Khởi tạo Database:**
```typescript
async initializeDatabase() {
  const db = await this.sqlite.createConnection(
    'tourdbSQLite',
    false,
    'no-encryption',
    1,
    false
  );
  
  await db.open();
  
  // Tạo bảng tours
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tours (
      tourID INTEGER PRIMARY KEY,
      tourName TEXT,
      description TEXT,
      price REAL,
      touristDestination TEXT,
      tourTypeID INTEGER,
      promotionID INTEGER,
      cached_at TEXT
    )
  `);
}
```

**Sync Data từ API:**
```typescript
async syncToursFromApi() {
  const tours = await this.http.get<Tour[]>(API_URL).toPromise();
  
  for (const tour of tours) {
    await this.db.run(
      'INSERT OR REPLACE INTO tours VALUES (?,?,?,?,?,?,?,?)',
      [tour.tourID, tour.tourName, tour.description, 
       tour.price, tour.touristDestination, tour.tourTypeID,
       tour.promotionID, new Date().toISOString()]
    );
  }
}
```

**Offline Access:**
```typescript
async getToursOffline(): Promise<Tour[]> {
  const result = await this.db.query('SELECT * FROM tours');
  return result.values || [];
}
```

### **Build & Deploy APK**

**Build Debug APK:**
```bash
# Build Angular app
ng build

# Sync với Capacitor
npx cap sync android

# Mở Android Studio
npx cap open android

# Build từ command line
cd android
./gradlew assembleDebug

# APK output location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

**Install APK trên Emulator/Device:**
```bash
# List devices
adb devices

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat | grep TravelVietnam
```

### **Truy Cập SQLite Database**

**Pull database từ device:**
```bash
# Sử dụng run-as để truy cập app-private data
adb shell "run-as com.travelvietnam.app cat databases/tourdbSQLite.db" > tourdb.db

# Xem database với sqlite3
sqlite3 tourdb.db
sqlite> .tables
sqlite> SELECT COUNT(*) FROM tours;
sqlite> SELECT tourName, price FROM tours LIMIT 5;
```

**Sử dụng DB Browser for SQLite:**
```bash
# macOS
brew install --cask db-browser-for-sqlite

# Mở file tourdb.db đã pull về
open -a "DB Browser for SQLite" tourdb.db
```

## 🌍 **Đa Ngôn Ngữ (i18n)**

### **Cài Đặt ngx-translate**

```bash
npm install @ngx-translate/core@17.0.0
```

### **Cấu Hình i18n**

**app.config.ts:**
```typescript
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}
  
  getTranslation(lang: string): Observable<any> {
    return this.http.get(`i18n/${lang}.json`);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'vi',
        loader: {
          provide: TranslateLoader,
          useClass: CustomTranslateLoader,
          deps: [HttpClient]
        }
      })
    )
  ]
};
```

### **Translation Files**

**i18n/vi.json:**
```json
{
  "TOUR": {
    "PRICE_FROM": "Từ",
    "PRICE_PER_PERSON": "/ người",
    "BOOK_TOUR": "Đặt tour",
    "DETAILS": "Chi tiết",
    "TOURS_FOUND": "tours được tìm thấy",
    "NO_TOURS_FOUND": "Không tìm thấy tour nào",
    "LOADING": "Đang tải tours...",
    "FILTER_ALL": "Tất cả",
    "FILTER_POPULAR": "Phổ biến",
    "FILTER_NEW": "Mới nhất",
    "BADGE_POPULAR": "Phổ biến",
    "BADGE_NEW": "Mới",
    "BADGE_PROMOTION": "Khuyến mãi",
    "BADGE_PREMIUM": "Cao cấp",
    "BADGE_BEST_PRICE": "Giá tốt"
  },
  "COMMON": {
    "SEARCH": "Tìm kiếm...",
    "LOADING": "Đang tải...",
    "ERROR": "Có lỗi xảy ra",
    "RETRY": "Thử lại"
  },
  "AUTH": {
    "LOGIN": "Đăng nhập",
    "REGISTER": "Đăng ký",
    "LOGOUT": "Đăng xuất",
    "PROFILE": "Hồ sơ"
  }
}
```

**i18n/en.json:**
```json
{
  "TOUR": {
    "PRICE_FROM": "From",
    "PRICE_PER_PERSON": "/ person",
    "BOOK_TOUR": "Book Tour",
    "DETAILS": "Details",
    "TOURS_FOUND": "tours found",
    "NO_TOURS_FOUND": "No tours found",
    "LOADING": "Loading tours...",
    "FILTER_ALL": "All",
    "FILTER_POPULAR": "Popular",
    "FILTER_NEW": "Newest",
    "BADGE_POPULAR": "Popular",
    "BADGE_NEW": "New",
    "BADGE_PROMOTION": "Promotion",
    "BADGE_PREMIUM": "Premium",
    "BADGE_BEST_PRICE": "Best Price"
  },
  "COMMON": {
    "SEARCH": "Search...",
    "LOADING": "Loading...",
    "ERROR": "An error occurred",
    "RETRY": "Retry"
  },
  "AUTH": {
    "LOGIN": "Login",
    "REGISTER": "Register",
    "LOGOUT": "Logout",
    "PROFILE": "Profile"
  }
}
```

### **Sử Dụng Translation trong Component**

**Template (HTML):**
```html
<!-- Interpolation với translate pipe -->
<h1>{{ 'TOUR.TOURS_FOUND' | translate }}</h1>
<button>{{ 'TOUR.BOOK_TOUR' | translate }}</button>
<p>{{ 'TOUR.PRICE_FROM' | translate }} {{ tour.price | currency:'VND' }}</p>

<!-- Attribute binding -->
<input [placeholder]="'COMMON.SEARCH' | translate">
```

**Component (TypeScript):**
```typescript
import { TranslateService } from '@ngx-translate/core';

export class TourListComponent {
  constructor(private translate: TranslateService) {}
  
  // Dịch động trong code
  getBadgeText(badge: string): string {
    return this.translate.instant(`TOUR.BADGE_${badge.toUpperCase()}`);
  }
  
  // Dịch với observable
  showError() {
    this.translate.get('COMMON.ERROR').subscribe(text => {
      console.log(text);
    });
  }
}
```

### **Language Service**

**language.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'app_language';
  
  constructor(private translate: TranslateService) {
    this.initLanguage();
  }
  
  initLanguage() {
    const savedLang = localStorage.getItem(this.STORAGE_KEY) || 'vi';
    this.translate.use(savedLang);
  }
  
  switchLanguage(lang: 'vi' | 'en') {
    this.translate.use(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }
  
  getCurrentLanguage(): string {
    return this.translate.currentLang;
  }
}
```

### **Language Switcher Component**

```typescript
@Component({
  selector: 'app-language-switcher',
  template: `
    <div class="language-switcher">
      <button (click)="switchLang('vi')" 
              [class.active]="currentLang === 'vi'">
        🇻🇳 VI
      </button>
      <button (click)="switchLang('en')" 
              [class.active]="currentLang === 'en'">
        🇬🇧 EN
      </button>
    </div>
  `
})
export class LanguageSwitcherComponent {
  currentLang: string;
  
  constructor(private languageService: LanguageService) {
    this.currentLang = this.languageService.getCurrentLanguage();
  }
  
  switchLang(lang: 'vi' | 'en') {
    this.languageService.switchLanguage(lang);
    this.currentLang = lang;
  }
}
```

### **Tại Sao Dùng {{ 'KEY' | translate }}?**

**Cú pháp:**
- `{{ }}`: Angular interpolation - hiển thị giá trị động
- `'TOUR.BOOK_TOUR'`: Key trong file translation JSON
- `| translate`: Pipe của ngx-translate để dịch key thành text

**Lợi ích:**
1. ✅ **Realtime switching**: Đổi ngôn ngữ không cần reload page
2. ✅ **Maintainable**: Quản lý text tập trung trong JSON files
3. ✅ **Scalable**: Dễ thêm ngôn ngữ mới (chỉ cần thêm file JSON)
4. ✅ **Type-safe**: TypeScript có thể check key tồn tại
5. ✅ **SEO-friendly**: Server-side rendering support

**So sánh:**
```html
<!-- ❌ Hard-coded - không linh hoạt -->
<button>Đặt tour</button>

<!-- ✅ i18n - đa ngôn ngữ -->
<button>{{ 'TOUR.BOOK_TOUR' | translate }}</button>
<!-- Tiếng Việt: "Đặt tour" -->
<!-- English: "Book Tour" -->
```

## �📦 **Deployment**

### **Backend Deployment**
```bash
# Build JAR
./mvnw clean package -DskipTests

# Run with profile
java -jar -Dspring.profiles.active=prod target/app.jar

# Docker (planned)
docker build -t tourism-backend .
docker run -p 8080:8080 tourism-backend
```

### **Frontend Deployment**
```bash
# Build production
ng build --configuration production

# Deploy to hosting
# - Vercel: vercel deploy
# - Netlify: netlify deploy
# - Firebase: firebase deploy
```

### **Mobile App Deployment**

**Build Release APK:**
```bash
# 1. Build Angular production
ng build --configuration production

# 2. Sync với Capacitor
npx cap sync android

# 3. Build release APK
cd android
./gradlew assembleRelease

# 4. Sign APK (nếu cần)
# Tạo keystore (chỉ làm 1 lần)
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 5. APK output:
# android/app/build/outputs/apk/release/app-release.apk
```

**Upload lên Google Play Store:**
1. Tạo tài khoản Google Play Developer
2. Tạo ứng dụng mới
3. Upload APK/AAB
4. Điền thông tin ứng dụng (screenshots, description)
5. Submit for review

**Build App Bundle (AAB) - Recommended:**
```bash
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

## � **Troubleshooting**

### **Backend Issues**

**Lỗi: "Connection refused" khi frontend gọi API**
```bash
# Kiểm tra backend có chạy không
lsof -i :8080

# Nếu không có process, start backend
cd travel-backend
./mvnw spring-boot:run

# Nếu có process cũ bị stuck
kill -9 <PID>
./mvnw clean spring-boot:run
```

**Lỗi: SQL Server connection timeout**
```bash
# Kiểm tra SQL Server
lsof -i :1433

# Restart SQL Server (macOS)
brew services restart mssql-server

# Test connection
sqlcmd -S localhost -U sa -P <password>
```

### **Frontend Issues**

**Lỗi: "Cannot find module '@ngx-translate/core'"**
```bash
# Cài đặt lại dependencies
rm -rf node_modules package-lock.json
npm install
```

**Lỗi: Icons bị nghiêng/tilted**
```css
/* Thêm vào styles.css */
.icon, .btn-icon, .logo-icon, .search-icon {
  display: inline-block !important;
  transform: rotate(0deg) !important;
  font-style: normal !important;
  vertical-align: middle;
  line-height: 1;
}
```

### **Mobile Issues**

**Lỗi: "Failed to open database"**
```typescript
// Kiểm tra SQLite plugin đã sync chưa
npx cap sync android

// Kiểm tra permission trong AndroidManifest.xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

**Lỗi: "Cleartext HTTP traffic not permitted"**
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<application android:usesCleartextTraffic="true">
```

**Lỗi: Cannot access localhost API from emulator**
```typescript
// Sử dụng 10.0.2.2 thay vì localhost trong emulator
const API_URL = 'http://10.0.2.2:8080/api';

// Hoặc sử dụng IP máy thực
const API_URL = 'http://192.168.1.x:8080/api';
```

**Pull database từ device/emulator:**
```bash
# Method 1: Using run-as (Debug builds only)
adb shell "run-as com.travelvietnam.app cat databases/tourdbSQLite.db" > tourdb.db

# Method 2: Root device
adb shell
su
cp /data/data/com.travelvietnam.app/databases/tourdbSQLite.db /sdcard/
exit
adb pull /sdcard/tourdbSQLite.db
```

### **i18n Issues**

**Lỗi: Translation không hoạt động**
```typescript
// Kiểm tra path trong CustomTranslateLoader
getTranslation(lang: string): Observable<any> {
  // Đúng: i18n/${lang}.json (relative to assets)
  return this.http.get(`i18n/${lang}.json`);
  
  // Sai: /i18n/${lang}.json (absolute path)
}
```

**Lỗi: Translation hiển thị key thay vì text**
```json
// Kiểm tra key trong JSON file có đúng không
{
  "TOUR": {
    "BOOK_TOUR": "Đặt tour"  // ✅ Có key này
  }
}

// Template phải match key
{{ 'TOUR.BOOK_TOUR' | translate }}  // ✅ Đúng
{{ 'TOUR.BOOKTOUR' | translate }}   // ❌ Sai (thiếu underscore)
```

## 📚 **Tài Liệu Tham Khảo**

### **Backend**
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Bean Validation](https://beanvalidation.org/)

### **Frontend**
- [Angular Documentation](https://angular.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)

### **Mobile**
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor SQLite Plugin](https://github.com/capacitor-community/sqlite)
- [Android Developers](https://developer.android.com/)

### **i18n**
- [ngx-translate Documentation](https://github.com/ngx-translate/core)
- [Angular i18n Guide](https://angular.io/guide/i18n)

## �📚 **Tài Liệu Tham Khảo**

### **Backend**
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Bean Validation](https://beanvalidation.org/)

### **Frontend**
- [Angular Documentation](https://angular.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)

## 👥 **Contributing**

### **Quy Tắc Commit**
```bash
# Format: <type>(<scope>): <subject>

# Examples:
git commit -m "feat(promotion): thêm tính năng quản lý khuyến mãi"
git commit -m "fix(booking): sửa lỗi tính toán giá"
git commit -m "docs(readme): cập nhật hướng dẫn cài đặt"
git commit -m "refactor(service): clean code promotion service"
```

### **Types**
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật documentation
- `refactor`: Refactor code
- `style`: Format code
- `test`: Thêm tests
- `chore`: Cập nhật build tools

## 📄 **License**

Dự án này được phát triển cho mục đích giáo dục và học tập.

## 🙏 **Acknowledgments**

- Spring Boot Team - Enterprise Java framework
- Angular Team - Modern web framework
- Capacitor Team - Cross-platform mobile runtime
- ngx-translate Contributors - i18n solution
- Capacitor Community SQLite - Offline database
- All open-source contributors

---

**📱 Mobile App Status:** ✅ Android APK available  
**🌍 i18n Status:** ✅ Vi/En fully supported  
**💾 Offline Mode:** ✅ SQLite caching enabled  
**🚀 Last Updated:** January 2025