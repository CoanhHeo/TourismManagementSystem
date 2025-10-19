# Hướng Dẫn Đẩy Dự Án QuanLyDuLich Lên GitHub

## Bước 1: Tạo Repository Trên GitHub

### 1.1. Đăng nhập GitHub
1. Truy cập: https://github.com
2. Đăng nhập tài khoản của bạn

### 1.2. Tạo Repository Mới
1. Click nút **"+"** ở góc trên bên phải
2. Chọn **"New repository"**
3. Điền thông tin:
   - **Repository name**: `QuanLyDuLich` (hoặc `travel-management-system`)
   - **Description**: `Hệ thống quản lý du lịch - Tour Management System (Spring Boot + Angular)`
   - **Visibility**: 
     - ✅ **Public** (mọi người có thể xem)
     - ⚪ **Private** (chỉ bạn xem được)
   - ⚠️ **KHÔNG CHỌN** các option:
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license
4. Click **"Create repository"**

### 1.3. Lưu URL Repository
Sau khi tạo, GitHub sẽ cho bạn URL dạng:
```
https://github.com/YOUR_USERNAME/QuanLyDuLich.git
```
Lưu lại URL này để dùng ở bước sau.

---

## Bước 2: Tạo File .gitignore

### 2.1. Mục đích
File `.gitignore` giúp Git bỏ qua các file không cần thiết như:
- Dependencies (node_modules, target/)
- Build outputs
- IDE files
- Sensitive data (application.properties với passwords)

### 2.2. Tạo file .gitignore ở root project
Tạo file `/Users/sanhnguyen/Documents/workspace-spring-tool-suite-4-4.21.0.RELEASE/QuanLyDuLich/.gitignore` với nội dung:

```gitignore
# ==========================================
# Backend (Spring Boot / Java / Maven)
# ==========================================

# Maven
travel-backend/target/
travel-backend/.mvn/
travel-backend/mvnw
travel-backend/mvnw.cmd

# Java
*.class
*.log
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar
hs_err_pid*

# IDE - IntelliJ IDEA
.idea/
*.iws
*.iml
*.ipr

# IDE - Eclipse
.classpath
.project
.settings/
bin/

# IDE - VS Code
.vscode/
*.code-workspace

# Spring Boot
travel-backend/application-local.properties
travel-backend/application-prod.properties
travel-backend/backend.log

# ==========================================
# Frontend (Angular / Node.js)
# ==========================================

# Dependencies
travel-frontend/node_modules/
travel-frontend/package-lock.json

# Build outputs
travel-frontend/dist/
travel-frontend/.angular/
travel-frontend/.sass-cache/

# IDE
travel-frontend/.vscode/
travel-frontend/.idea/

# Misc
travel-frontend/*.log
travel-frontend/npm-debug.log*
travel-frontend/yarn-debug.log*
travel-frontend/yarn-error.log*

# Environment
travel-frontend/.env
travel-frontend/.env.local

# ==========================================
# Database
# ==========================================

# Database files
*.db
*.sqlite
*.sql.backup

# ==========================================
# OS Files
# ==========================================

# macOS
.DS_Store
.AppleDouble
.LSOverride
._*

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini

# Linux
*~

# ==========================================
# Temporary Files
# ==========================================

*.tmp
*.temp
*.swp
*.swo
*~

# ==========================================
# Documentation temp files
# ==========================================

*.pdf.bak
*.docx~

# ==========================================
# Custom ignores for this project
# ==========================================

# Backend logs
travel-backend/*.log

# Cookies
travel-backend/cookies.txt

# Backup files
*.backup
*.bak

# Test outputs
coverage/
*.coverage
```

---

## Bước 3: Khởi Tạo Git Repository Local

### 3.1. Mở Terminal tại thư mục dự án
```bash
cd /Users/sanhnguyen/Documents/workspace-spring-tool-suite-4-4.21.0.RELEASE/QuanLyDuLich
```

### 3.2. Kiểm tra Git đã cài chưa
```bash
git --version
```

Nếu chưa cài, tải tại: https://git-scm.com/downloads

### 3.3. Khởi tạo Git repository
```bash
git init
```

Output: `Initialized empty Git repository in .../QuanLyDuLich/.git/`

### 3.4. Cấu hình Git (lần đầu)
```bash
# Set username
git config --global user.name "Your Name"

# Set email (dùng email GitHub)
git config --global user.email "your.email@example.com"

# Verify
git config --list
```

---

## Bước 4: Tạo File README.md

### 4.1. Tạo file README.md ở root
Tạo file `/Users/sanhnguyen/Documents/workspace-spring-tool-suite-4-4.21.0.RELEASE/QuanLyDuLich/README.md`:

```markdown
# 🌍 QuanLyDuLich - Travel Management System

Hệ thống quản lý du lịch với đầy đủ chức năng cho admin và khách hàng.

## 📋 Tính Năng

### 👨‍💼 Admin
- Dashboard với thống kê (tours, customers, revenue, bookings)
- Quản lý Tour (CRUD)
- Quản lý Lịch Khởi Hành (CRUD, tự động tính số ngày)
- Gán Hướng Dẫn Viên cho lịch khởi hành
- Quản lý Khuyến Mãi
- Xem danh sách đặt tour

### 👥 Customer
- Xem danh sách tour
- Tìm kiếm và filter tour
- Đặt tour với chọn khuyến mãi
- Xem lịch sử đặt tour
- Đăng ký / Đăng nhập

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.5.6
- **Language**: Java 21
- **Database**: SQL Server 16.0
- **ORM**: JPA / Hibernate
- **Build Tool**: Maven

### Frontend
- **Framework**: Angular 18.2.14
- **Language**: TypeScript
- **Styling**: CSS3 with gradients
- **Architecture**: Standalone Components

## 📁 Cấu Trúc Dự Án

```
QuanLyDuLich/
├── travel-backend/          # Spring Boot API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/example/travel/
│   │   │   │       ├── controller/
│   │   │   │       ├── entity/
│   │   │   │       ├── repository/
│   │   │   │       ├── service/
│   │   │   │       ├── dto/
│   │   │   │       └── config/
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── travel-frontend/         # Angular SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Guards, Interceptors
│   │   │   └── shared/      # Services, Models, Utils
│   │   ├── features/
│   │   │   ├── admin/       # Admin components
│   │   │   ├── auth/        # Login/Register
│   │   │   └── tour/        # Tour browsing & booking
│   │   └── environments/
│   ├── angular.json
│   └── package.json
│
├── SQLQuery_QLDL_Fix18102025.sql  # Database schema
└── README.md
```

## 🚀 Cài Đặt & Chạy Dự Án

### Prerequisites
- Java 21+
- Node.js 18+
- Maven 3.8+
- SQL Server 2016+

### 1. Setup Database
```sql
-- Chạy file SQL để tạo database
sqlcmd -S localhost -i SQLQuery_QLDL_Fix18102025.sql
```

### 2. Backend Setup
```bash
cd travel-backend

# Cấu hình database trong application.properties
# spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=QuanLyDuLich
# spring.datasource.username=YOUR_USERNAME
# spring.datasource.password=YOUR_PASSWORD

# Build & Run
./mvnw clean package
java -jar target/ql-dulich-api-0.0.1-SNAPSHOT.jar

# Backend running at http://localhost:8080
```

### 3. Frontend Setup
```bash
cd travel-frontend

# Install dependencies
npm install

# Run development server
ng serve

# Frontend running at http://localhost:4200
```

### 4. Test Login
- **Admin**: admin@gmail.com / Sanh123@
- **Customer**: khach1@gmail.com / 123456

## 📡 API Endpoints

### Authentication
- POST `/api/auth/login` - Login
- POST `/api/auth/register` - Register

### Admin
- GET `/api/admin/stats` - Dashboard statistics
- POST `/api/tours` - Create tour
- PUT `/api/tours/{id}` - Update tour
- DELETE `/api/tours/{id}` - Delete tour
- POST `/api/tour-departures` - Create departure
- PUT `/api/tour-departures/{id}` - Update departure
- PUT `/api/tour-departures/{id}/assign-guide/{guideId}` - Assign guide

### Customer
- GET `/api/tours` - Get all tours
- GET `/api/tour-departures/upcoming` - Get upcoming departures
- POST `/api/bookings` - Create booking
- GET `/api/bookings/user/{userId}` - Get user bookings

### Utilities
- GET `/api/tour-types` - Get tour types
- GET `/api/promotions` - Get promotions
- GET `/api/promotions/active` - Get active promotions

## 🐛 Đã Sửa

### Fix 1: Auto-Calculate DayNum
**Issue**: Số ngày có thể không khớp với thời gian khởi hành - kết thúc
**Solution**: Tự động tính `dayNum = Math.ceil(diffDays)` từ datetime
**File**: `add-tour-departure.component.ts`

### Fix 2: DateCreated NULL
**Issue**: DateCreated bị NULL khi tạo TourDeparture
**Solution**: Thêm `@PrePersist` để auto-set `LocalDate.now()`
**File**: `TourDeparture.java`

### Fix 3: Promotion Relationship
**Issue**: Promotion được thêm vào TourDeparture (sai schema)
**Solution**: Xóa promotion khỏi TourDeparture, sẽ implement ở Tour
**File**: `add-tour-departure.component.ts`

## 📝 Todo List

- [ ] Implement Tour-Promotion Many-to-Many relationship
- [ ] Tour list/edit/delete UI (admin)
- [ ] Departure list/edit/delete UI (admin)
- [ ] Guide assignment UI
- [ ] Booking management UI (admin)
- [ ] Add Spring Security with JWT
- [ ] Unit tests
- [ ] Integration tests
- [ ] Docker deployment

## 👨‍💻 Contributor

- **Developer**: Sanh Nguyen
- **Email**: your.email@example.com
- **GitHub**: https://github.com/YOUR_USERNAME

## 📄 License

This project is for educational purposes.

## 📞 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub.
```

---

## Bước 5: Stage & Commit Files

### 5.1. Kiểm tra status
```bash
git status
```

Output sẽ hiển thị tất cả file chưa được track (màu đỏ).

### 5.2. Stage tất cả files
```bash
git add .
```

### 5.3. Kiểm tra lại
```bash
git status
```

Output sẽ hiển thị files đã staged (màu xanh).

### 5.4. Commit
```bash
git commit -m "Initial commit: Travel Management System with Spring Boot & Angular"
```

---

## Bước 6: Kết Nối Với GitHub Remote

### 6.1. Thêm remote repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/QuanLyDuLich.git
```

Thay `YOUR_USERNAME` bằng username GitHub của bạn.

### 6.2. Verify remote
```bash
git remote -v
```

Output:
```
origin  https://github.com/YOUR_USERNAME/QuanLyDuLich.git (fetch)
origin  https://github.com/YOUR_USERNAME/QuanLyDuLich.git (push)
```

---

## Bước 7: Đẩy Code Lên GitHub

### 7.1. Tạo nhánh main
```bash
git branch -M main
```

### 7.2. Push lên GitHub
```bash
git push -u origin main
```

### 7.3. Xác thực
GitHub sẽ yêu cầu đăng nhập:
- **Username**: GitHub username
- **Password**: Không dùng password nữa, phải dùng **Personal Access Token** (PAT)

#### Tạo Personal Access Token:
1. Vào GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Chọn scopes: `repo` (full control)
5. Generate token và copy token này
6. Paste token vào terminal khi được hỏi password

### 7.4. Verify
Sau khi push thành công, truy cập:
```
https://github.com/YOUR_USERNAME/QuanLyDuLich
```

Bạn sẽ thấy tất cả code đã được upload!

---

## Bước 8: Thêm Secrets File (Optional)

### 8.1. Tạo file application-secrets.properties
Nếu bạn không muốn expose database password, tạo file:
```
travel-backend/src/main/resources/application-secrets.properties
```

Nội dung:
```properties
spring.datasource.password=YOUR_REAL_PASSWORD
```

### 8.2. Thêm vào .gitignore
```gitignore
travel-backend/src/main/resources/application-secrets.properties
```

### 8.3. Update application.properties
```properties
# Remove password from here
spring.datasource.password=

# Import secrets (won't be in Git)
spring.config.import=optional:classpath:application-secrets.properties
```

---

## Các Lệnh Git Thường Dùng

### Khi có thay đổi mới:
```bash
# 1. Xem file thay đổi
git status

# 2. Stage files
git add .                    # Tất cả files
git add file.txt             # File cụ thể
git add src/                 # Thư mục cụ thể

# 3. Commit
git commit -m "Mô tả thay đổi"

# 4. Push lên GitHub
git push
```

### Xem lịch sử:
```bash
# Xem các commit
git log

# Xem log gọn
git log --oneline

# Xem thay đổi
git diff
```

### Branches:
```bash
# Tạo branch mới
git checkout -b feature/new-feature

# Chuyển branch
git checkout main

# Merge branch
git merge feature/new-feature

# Push branch
git push origin feature/new-feature
```

### Làm việc nhóm:
```bash
# Pull code mới nhất
git pull origin main

# Xem remote
git remote -v

# Clone repository
git clone https://github.com/USERNAME/QuanLyDuLich.git
```

---

## Troubleshooting

### Lỗi: "failed to push some refs"
```bash
# Pull trước khi push
git pull origin main --rebase
git push
```

### Lỗi: "Permission denied"
→ Dùng Personal Access Token thay vì password

### Lỗi: "Repository not found"
→ Kiểm tra URL remote: `git remote -v`
→ Update nếu sai: `git remote set-url origin NEW_URL`

### Xóa file đã commit nhầm:
```bash
# Xóa file nhưng giữ trong working directory
git rm --cached file.txt
git commit -m "Remove file.txt from tracking"
git push

# Thêm vào .gitignore để không track nữa
echo "file.txt" >> .gitignore
```

### Revert commit cuối:
```bash
# Undo commit nhưng giữ changes
git reset --soft HEAD~1

# Undo commit và xóa changes
git reset --hard HEAD~1
```

---

## Best Practices

### 1. Commit Messages
✅ Good:
```
feat: Add tour departure auto-calculation
fix: Resolve DateCreated NULL issue
docs: Update README with setup instructions
```

❌ Bad:
```
update
fix bug
changes
```

### 2. Commit Frequency
- Commit nhỏ, thường xuyên
- Mỗi commit 1 feature/fix cụ thể
- Không commit code chưa test

### 3. Branch Strategy
- `main`: Production-ready code
- `develop`: Development code
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent fixes

### 4. Files Không Nên Commit
- ❌ node_modules/
- ❌ target/
- ❌ .env files
- ❌ Database passwords
- ❌ IDE config files
- ❌ Log files
- ❌ Build outputs

### 5. Before Pushing
```bash
# 1. Test code
npm test            # Frontend
./mvnw test         # Backend

# 2. Build
ng build            # Frontend
./mvnw clean package  # Backend

# 3. Check .gitignore
git status          # No sensitive files?

# 4. Review changes
git diff

# 5. Push
git push
```

---

## GitHub Features Hữu Ích

### 1. GitHub Actions (CI/CD)
Tự động test và deploy khi push code.

### 2. Issues
Track bugs và features.

### 3. Pull Requests
Code review trước khi merge.

### 4. Projects
Kanban board để quản lý tasks.

### 5. Wiki
Documentation chi tiết.

### 6. Releases
Tag phiên bản stable.

---

## Checklist Hoàn Thành

- [ ] Tạo repository trên GitHub
- [ ] Tạo file .gitignore
- [ ] Tạo file README.md
- [ ] Khởi tạo Git local: `git init`
- [ ] Stage files: `git add .`
- [ ] Commit: `git commit -m "Initial commit"`
- [ ] Add remote: `git remote add origin URL`
- [ ] Push: `git push -u origin main`
- [ ] Verify trên GitHub
- [ ] Update README với username/email thực
- [ ] (Optional) Setup GitHub Actions
- [ ] (Optional) Invite collaborators

---

## Tài Liệu Tham Khảo

- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com
- Pro Git Book: https://git-scm.com/book/en/v2

---

**Date**: 19/10/2025  
**Status**: ✅ READY TO PUSH
