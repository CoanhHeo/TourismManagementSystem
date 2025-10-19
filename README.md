# 🌴 QuanLyDuLich - Travel Management System

A modern, full-stack travel booking platform built with **Spring Boot 3** and **Angular 18**.

## 📁 **Optimized Project Structure**

```
QuanLyDuLich/
├── travel-backend/                    # Spring Boot 3.5.6 Backend
│   └── src/main/java/com/example/travel/
│       ├── TravelApplication.java     # Main application entry point
│       ├── config/                    # Configuration classes
│       │   ├── ApplicationConfig.java # App-specific beans & profiles
│       │   └── WebConfig.java         # CORS & web configuration
│       ├── controller/                # REST API controllers
│       │   ├── AuthController.java    # Authentication endpoints
│       │   ├── KhachHangController.java # Customer CRUD operations
│       │   ├── TourController.java    # Tour management
│       │   └── DangKyController.java  # Booking operations
│       ├── dto/                       # Data Transfer Objects
│       │   ├── AuthenticationDto.java # Auth request/response DTOs
│       │   └── TourDto.java          # Tour-related DTOs
│       ├── entity/                    # JPA entities
│       │   ├── KhachHang.java        # Customer entity
│       │   ├── Tour.java             # Tour entity
│       │   ├── DangKy.java           # Booking entity
│       │   └── UserAccount.java      # User account entity
│       ├── exception/                 # Exception handling
│       │   ├── TravelApplicationException.java
│       │   └── GlobalExceptionHandler.java
│       ├── repository/                # Data access layer
│       │   ├── KhachHangRepository.java
│       │   ├── TourRepository.java
│       │   ├── DangKyRepository.java
│       │   └── UserAccountRepository.java
│       ├── security/                  # Security configurations
│       ├── service/                   # Business logic layer
│       │   ├── AuthService.java      # Authentication services
│       │   ├── ValidationService.java # Input validation
│       │   ├── OtpService.java       # OTP generation/verification
│       │   └── DangKyService.java    # Booking business logic
│       └── utils/                     # Utility classes
│           └── TravelUtils.java       # Common utility functions
└── travel-frontend/                   # Angular 18 Frontend
    └── src/
        ├── app/
        │   ├── core/                  # Core application modules
        │   │   └── services/          # Singleton services
        │   │       └── api/           # HTTP services
        │   │           ├── auth.service.ts
        │   │           ├── tour.service.ts
        │   │           ├── khachhang.service.ts
        │   │           └── dangky.service.ts
        │   ├── shared/                # Shared resources
        │   │   ├── components/        # Reusable components
        │   │   │   └── loading-spinner.component.ts
        │   │   ├── models/            # TypeScript interfaces
        │   │   │   └── interfaces.ts  # App-wide type definitions
        │   │   └── utils/             # Utility functions & constants
        │   │       ├── utils.ts       # Helper functions
        │   │       └── constants.ts   # App constants
        │   ├── features/              # Feature modules
        │   │   ├── auth/              # Authentication feature
        │   │   │   ├── login/         # Login component
        │   │   │   └── register/      # Registration component
        │   │   ├── tour/              # Tour management feature
        │   │   │   └── tour-list/     # Tour listing component
        │   │   └── dangky/            # Booking feature
        │   │       └── dangky-form/   # Booking form component
        │   ├── app.component.ts       # Root component
        │   ├── app.config.ts          # App configuration
        │   └── app.routes.ts          # Routing configuration
        └── environments/              # Environment configurations
            └── environment.ts         # API endpoints & settings
```

## 🏗️ **Architecture Principles**

### **Backend (Spring Boot)**

#### **1. Layered Architecture**
- **Controller Layer**: REST API endpoints with proper HTTP status codes
- **Service Layer**: Business logic and transaction management
- **Repository Layer**: Data access abstraction with JPA
- **Entity Layer**: Database models with proper relationships

#### **2. Separation of Concerns**
- **DTOs**: Separate API contracts from internal entities
- **Exception Handling**: Global exception handler for consistent error responses
- **Validation**: Centralized input validation service
- **Configuration**: Environment-specific configurations

#### **3. Best Practices**
- ✅ **Dependency Injection**: Constructor-based injection
- ✅ **Error Handling**: Comprehensive exception hierarchy
- ✅ **Validation**: Bean validation with custom validators
- ✅ **CORS Configuration**: Proper cross-origin setup
- ✅ **Documentation**: Comprehensive JavaDoc comments

### **Frontend (Angular)**

#### **1. Feature-Based Structure**
- **Core Module**: Singleton services and guards
- **Shared Module**: Reusable components and utilities
- **Feature Modules**: Self-contained business features

#### **2. Smart Architecture Patterns**
- ✅ **Standalone Components**: Modern Angular 18 approach
- ✅ **Reactive Forms**: Type-safe form handling
- ✅ **Observables**: Reactive programming with RxJS
- ✅ **State Management**: BehaviorSubject for simple state
- ✅ **Type Safety**: Strong TypeScript typing throughout

#### **3. Modern UI/UX**
- 🎨 **Modern Design**: Professional travel platform aesthetics
- 📱 **Responsive Layout**: Mobile-first responsive design
- ⚡ **Performance**: Optimized loading and interactions
- 🔐 **Security**: Proper form validation and error handling

## 🚀 **Key Features**

### **Authentication System**
- ✅ Multi-step registration with OTP verification
- ✅ Email and phone number validation
- ✅ Password strength requirements
- ✅ Vietnamese province selection
- ✅ Modern login/register UI

### **Tour Management**
- ✅ Professional tour listing with search
- ✅ Grid and list view options
- ✅ Real-time filtering
- ✅ Responsive tour cards

### **Booking System**
- ✅ Tour registration functionality
- ✅ Customer management
- ✅ Price calculation

## 🛠️ **Technology Stack**

### **Backend**
- **Framework**: Spring Boot 3.5.6
- **Language**: Java 21
- **Database**: SQL Server
- **ORM**: Spring Data JPA
- **Validation**: Bean Validation (JSR-303)
- **Architecture**: RESTful API with layered architecture

### **Frontend**
- **Framework**: Angular 18
- **Language**: TypeScript 5
- **Styling**: Modern CSS with gradients and animations
- **Architecture**: Feature-based with standalone components
- **State Management**: RxJS Observables

## 📋 **API Endpoints**

### **Authentication (`/api/auth`)**
```
POST /register          # Register new customer
POST /verify-otp        # Verify OTP code
POST /resend-otp        # Resend OTP
POST /login             # Customer login
POST /logout            # Customer logout
GET  /status            # Check authentication status
```

### **Customers (`/api/khachhang`)**
```
GET    /               # Get all customers
GET    /{id}           # Get customer by ID
POST   /               # Create customer
PUT    /{id}           # Update customer
DELETE /{id}           # Delete customer
GET    /search         # Search customers
```

### **Tours (`/api/tour`)**
```
GET    /               # Get all tours
GET    /{id}           # Get tour by ID
```

### **Bookings (`/api/dangky`)**
```
POST   /               # Create booking
```

## 🔧 **Development Setup**

### **Prerequisites**
- Java 21+
- Node.js 18+
- SQL Server
- Maven 3.6+

### **Backend Setup**
```bash
cd travel-backend
./mvnw clean install
./mvnw spring-boot:run
```

### **Frontend Setup**
```bash
cd travel-frontend
npm install
npm start
```

### **URLs**
- **Backend API**: http://localhost:8080
- **Frontend**: http://localhost:4200 (or auto-assigned port)

## 📊 **Code Quality Features**

### **Backend Quality**
- ✅ Proper exception handling with custom exceptions
- ✅ Input validation with Bean Validation
- ✅ Consistent API response structure
- ✅ Separation of DTOs from entities
- ✅ Transaction management
- ✅ Logging configuration

### **Frontend Quality**
- ✅ Strong TypeScript typing
- ✅ Reusable component library
- ✅ Centralized constants and utilities
- ✅ Consistent error handling
- ✅ Modern CSS architecture
- ✅ Responsive design principles

## 🎯 **Future Enhancements**

### **Security**
- [ ] JWT authentication
- [ ] Role-based access control
- [ ] API rate limiting
- [ ] HTTPS configuration

### **Features**
- [ ] Payment integration
- [ ] Email notifications
- [ ] Tour reviews and ratings
- [ ] Advanced search filters
- [ ] Booking history

### **Technical**
- [ ] Database migration scripts
- [ ] Unit and integration tests
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Performance monitoring

## 📝 **Contributing**

1. Follow the established architecture patterns
2. Maintain separation of concerns
3. Add proper documentation
4. Include error handling
5. Follow TypeScript/Java naming conventions

## 📄 **License**

This project is for educational purposes.

---

**Built with ❤️ using modern web technologies**