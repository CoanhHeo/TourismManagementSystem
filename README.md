# 🌴 Hệ Thống Quản Lý Du Lịch - Tourism Management System

Nền tảng đặt tour du lịch hiện đại, full-stack được xây dựng với **Spring Boot 3** và **Angular 18**.

## 🌟 **Tính Năng Chính**

### **🔐 Hệ Thống Xác Thực & Phân Quyền**
- ✅ Đăng ký đa bước với xác thực OTP qua email
- ✅ Xác thực email và số điện thoại
- ✅ Yêu cầu mật khẩu mạnh
- ✅ Chọn tỉnh/thành phố Việt Nam
- ✅ Giao diện đăng nhập/đăng ký hiện đại
- ✅ Phân quyền: Customer, Tour Guide, Admin

### **🎫 Quản Lý Tour Du Lịch**
- ✅ Danh sách tour chuyên nghiệp với tìm kiếm
- ✅ Hiển thị dạng lưới và danh sách
- ✅ Lọc theo loại tour, địa điểm
- ✅ Thẻ tour responsive với hình ảnh
- ✅ Thông tin chi tiết tour
- ✅ Quản lý chuyến khởi hành (Tour Departure)
- ✅ Admin: CRUD tours đầy đủ

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

### **� Quản Lý Hướng Dẫn Viên**
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
│       │   ├── UserController.java    # Xác thực & User
│       │   ├── TourController.java    # Quản lý tours
│       │   ├── TourDepartureController.java # Chuyến khởi hành
│       │   ├── PromotionController.java     # Khuyến mãi
│       │   ├── BookingController.java       # Đặt tour
│       │   ├── TourGuideController.java     # Tour Guide
│       │   └── AdminController.java         # Admin
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
        │   │   └── dangky/            # Legacy booking
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

## 📦 **Deployment**

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

## 📚 **Tài Liệu Tham Khảo**

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

- Spring Boot Team
- Angular Team
- All open-source contributors

---