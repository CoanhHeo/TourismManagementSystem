# Cấu Trúc Thư Mục Frontend (Angular 18)

## 📁 Tổng Quan Cấu Trúc

```
travel-frontend/
├── src/
│   ├── app/                          # Main application folder
│   │   ├── core/                     # Core module (singleton services)
│   │   │   ├── guards/              # Route guards (auth, admin)
│   │   │   └── services/            # Core services
│   │   │       └── api/             # API services
│   │   │           ├── auth.service.ts
│   │   │           ├── tour.service.ts
│   │   │           ├── booking.service.ts
│   │   │           ├── user.service.ts
│   │   │           └── ...
│   │   │
│   │   ├── shared/                  # Shared module (reusable components)
│   │   │   ├── components/         # Shared components
│   │   │   │   ├── loading-spinner.component.ts
│   │   │   │   ├── toast-notification.component.ts
│   │   │   │   └── language-switcher.component.ts
│   │   │   ├── models/             # TypeScript interfaces
│   │   │   │   └── interfaces.ts
│   │   │   ├── services/           # Shared services
│   │   │   │   └── toast.service.ts
│   │   │   └── utils/              # Utilities
│   │   │       ├── constants.ts
│   │   │       └── utils.ts
│   │   │
│   │   ├── features/               # Feature modules (lazy-loaded)
│   │   │   ├── auth/              # Authentication feature
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   │
│   │   │   ├── tour/              # Tour management feature
│   │   │   │   ├── tour-list/
│   │   │   │   ├── tour-booking/
│   │   │   │   ├── my-bookings/
│   │   │   │   └── my-tours/
│   │   │   │
│   │   │   ├── booking/           # Booking feature
│   │   │   │   └── booking-form/
│   │   │   │
│   │   │   ├── admin/             # Admin dashboard feature
│   │   │   │   ├── admin-dashboard/
│   │   │   │   ├── add-tour/
│   │   │   │   ├── manage-tours/
│   │   │   │   ├── manage-users/
│   │   │   │   └── ...
│   │   │   │
│   │   │   └── tour-guide/        # Tour guide feature
│   │   │       ├── dashboard/
│   │   │       └── passengers/
│   │   │
│   │   ├── layouts/               # Layout components (future)
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   └── sidebar/
│   │   │
│   │   ├── app.component.ts       # Root component
│   │   ├── app.component.html
│   │   ├── app.component.css
│   │   ├── app.config.ts          # App configuration
│   │   └── app.routes.ts          # Routing configuration
│   │
│   ├── assets/                    # Static assets
│   │   ├── images/               # Images
│   │   ├── icons/                # Icons
│   │   └── fonts/                # Custom fonts
│   │
│   ├── environments/              # Environment configurations
│   │   └── environment.ts
│   │
│   ├── index.html                # Main HTML file
│   ├── main.ts                   # Application entry point
│   └── styles.css                # Global styles
│
├── public/                        # Public assets (PWA)
│   └── manifest.json
│
├── angular.json                   # Angular configuration
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript configuration
└── README.md

```

## 📋 Quy Tắc Tổ Chức

### 1. **Core Module** (`src/app/core/`)
- **Mục đích**: Chứa các singleton services, guards, interceptors được dùng toàn ứng dụng
- **Quy tắc**: 
  - Chỉ import **MỘT LẦN** trong `app.config.ts`
  - Không import trực tiếp trong feature modules
  - Services: `providedIn: 'root'`

**Ví dụ:**
```typescript
// core/services/api/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService { ... }
```

### 2. **Shared Module** (`src/app/shared/`)
- **Mục đích**: Components, directives, pipes tái sử dụng
- **Quy tắc**:
  - Import vào **MỌI** feature module cần dùng
  - Không chứa business logic phức tạp
  - Components phải standalone

**Ví dụ:**
```typescript
// shared/components/loading-spinner.component.ts
@Component({
  standalone: true,
  selector: 'app-loading-spinner',
  ...
})
```

### 3. **Features Module** (`src/app/features/`)
- **Mục đích**: Các tính năng chính của ứng dụng
- **Quy tắc**:
  - Mỗi feature là một module độc lập
  - Có thể lazy-load
  - Có routing riêng
  - Components standalone

**Cấu trúc feature:**
```
feature-name/
├── components/          # Feature-specific components
├── services/           # Feature-specific services
├── models/             # Feature-specific models
└── feature.routes.ts   # Feature routing
```

### 4. **Layouts Module** (`src/app/layouts/`)
- **Mục đích**: Layout components (header, footer, sidebar)
- **Quy tắc**:
  - Tái sử dụng cho nhiều pages
  - Responsive design
  - Standalone components

### 5. **Assets** (`src/assets/`)
- **Mục đích**: Static files (images, icons, fonts)
- **Quy tắc**:
  - Tổ chức theo loại file
  - Optimize trước khi commit
  - Sử dụng relative paths

## 🔄 Import Paths

### Absolute Imports (Recommended)
Configure trong `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@app/*": ["app/*"],
      "@core/*": ["app/core/*"],
      "@shared/*": ["app/shared/*"],
      "@features/*": ["app/features/*"],
      "@environments/*": ["environments/*"]
    }
  }
}
```

**Ví dụ sử dụng:**
```typescript
// Instead of: import { AuthService } from '../../../core/services/api/auth.service';
import { AuthService } from '@core/services/api/auth.service';

// Instead of: import { User } from '../../shared/models/interfaces';
import { User } from '@shared/models/interfaces';
```

## 📦 Naming Conventions

### Files
- Components: `*.component.ts`
- Services: `*.service.ts`
- Guards: `*.guard.ts`
- Interfaces: `interfaces.ts` hoặc `*.model.ts`
- Constants: `constants.ts`
- Utils: `utils.ts` hoặc `*.util.ts`

### Classes/Interfaces
- PascalCase: `UserService`, `TourBooking`
- Interfaces có thể prefix `I`: `IUser` (optional)

### Variables/Functions
- camelCase: `userName`, `getTourList()`
- Constants: UPPER_SNAKE_CASE: `API_BASE_URL`

## 🎯 Best Practices

1. **Standalone Components** (Angular 18+)
   ```typescript
   @Component({
     standalone: true,
     imports: [CommonModule, FormsModule],
     ...
   })
   ```

2. **Dependency Injection**
   ```typescript
   constructor(
     private authService: AuthService,
     private router: Router
   ) {}
   ```

3. **Lazy Loading**
   ```typescript
   {
     path: 'admin',
     loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component')
   }
   ```

4. **Type Safety**
   ```typescript
   users: User[] = [];
   tour?: Tour;
   ```

5. **Responsive Design**
   - Mobile-first approach
   - Use CSS media queries
   - Touch optimization

## 🚀 Migration Checklist

- [x] Di chuyển `features/` vào `app/`
- [x] Tạo `assets/` folder
- [x] Tạo `layouts/` folder
- [x] Cập nhật import paths trong `app.routes.ts`
- [x] Thêm responsive CSS cho mobile
- [ ] Setup absolute imports trong `tsconfig.json`
- [ ] Tạo layout components (header, footer)
- [ ] Optimize images trong `assets/`
- [ ] Add PWA support với service worker

## 📚 Tài Liệu Tham Khảo

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Angular Architecture](https://angular.io/guide/architecture)
- [Angular Standalone Components](https://angular.io/guide/standalone-components)
