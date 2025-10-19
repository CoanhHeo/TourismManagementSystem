# 🔧 Sửa lỗi Trang Quản lý Tours

## 📋 Vấn đề

### 1. ❌ Cột "Giá gốc" không hợp lý
- Tours không có thuộc tính `originalPrice`
- Chỉ có TourDeparture mới có giá gốc
- Hiển thị cột này gây nhầm lẫn

### 2. ❌ Cột "Khuyến mãi" không load được data
- Backend API `/api/tours` trả về `TourWithPriceDTO`
- `TourWithPriceDTO` thiếu field `promotion`
- Frontend không nhận được thông tin khuyến mãi

---

## ✅ Giải pháp

### 1. Frontend: Xóa cột "Giá gốc"

**File:** `travel-frontend/src/features/admin/manage-tours/manage-tours.component.ts`

#### Thay đổi 1: Xóa `originalPrice` khỏi interface
```typescript
// ❌ TRƯỚC
interface Tour {
  tourID: number;
  tourName: string;
  description: string;
  touristDestination: string;
  originalPrice?: number;  // ← XÓA
  tourType?: {...};
  promotion?: {...};
}

// ✅ SAU
interface Tour {
  tourID: number;
  tourName: string;
  description: string;
  touristDestination: string;
  tourType?: {...};
  promotion?: {...};
}
```

#### Thay đổi 2: Xóa cột "Giá gốc" trong bảng
```html
<!-- ❌ TRƯỚC: 7 cột -->
<thead>
  <tr>
    <th>ID</th>
    <th>Tên Tour</th>
    <th>Điểm đến</th>
    <th>Loại Tour</th>
    <th>Giá gốc</th>      <!-- XÓA -->
    <th>Khuyến mãi</th>
    <th>Thao tác</th>
  </tr>
</thead>

<!-- ✅ SAU: 6 cột -->
<thead>
  <tr>
    <th>ID</th>
    <th>Tên Tour</th>
    <th>Điểm đến</th>
    <th>Loại Tour</th>
    <th>Khuyến mãi</th>
    <th>Thao tác</th>
  </tr>
</thead>
```

#### Thay đổi 3: Xóa cell hiển thị giá
```html
<!-- ❌ TRƯỚC -->
<td class="price">
  <span *ngIf="tour.originalPrice" class="price-value">
    {{ formatPrice(tour.originalPrice) }}
  </span>
  <span *ngIf="!tour.originalPrice" class="no-price">Chưa có</span>
</td>
<!-- XÓA TOÀN BỘ -->

<!-- ✅ SAU: Không còn -->
```

#### Thay đổi 4: Update colspan trong empty row
```html
<!-- ❌ TRƯỚC -->
<td colspan="7" class="empty-message">

<!-- ✅ SAU -->
<td colspan="6" class="empty-message">
```

---

### 2. Backend: Thêm promotion vào TourWithPriceDTO

**File:** `travel-backend/src/main/java/com/example/travel/dto/TourWithPriceDTO.java`

#### Thay đổi 1: Import Promotion entity
```java
// ✅ THÊM
import com.example.travel.entity.Promotion;
```

#### Thay đổi 2: Thêm field promotion
```java
public class TourWithPriceDTO {
    private Integer tourID;
    private String tourName;
    private String description;
    private String touristDestination;
    private TourType tourType;
    private Promotion promotion;  // ✅ THÊM MỚI
    private Double originalPrice;
    private Integer totalBookings;
```

#### Thay đổi 3: Update constructors
```java
public TourWithPriceDTO(Tour tour, Double minPrice) {
    this.tourID = tour.getTourID();
    this.tourName = tour.getTourName();
    this.description = tour.getDescription();
    this.touristDestination = tour.getTouristDestination();
    this.tourType = tour.getTourType();
    this.promotion = tour.getPromotion();  // ✅ THÊM
    this.originalPrice = minPrice;
    this.totalBookings = 0;
}

public TourWithPriceDTO(Tour tour, Double minPrice, Integer totalBookings) {
    this.tourID = tour.getTourID();
    this.tourName = tour.getTourName();
    this.description = tour.getDescription();
    this.touristDestination = tour.getTouristDestination();
    this.tourType = tour.getTourType();
    this.promotion = tour.getPromotion();  // ✅ THÊM
    this.originalPrice = minPrice;
    this.totalBookings = totalBookings != null ? totalBookings : 0;
}
```

#### Thay đổi 4: Thêm getter/setter
```java
public Promotion getPromotion() {
    return promotion;
}

public void setPromotion(Promotion promotion) {
    this.promotion = promotion;
}
```

---

## 🎯 Kết quả

### Trước khi sửa:
```
╔══════╦═══════════╦═══════════╦═══════════╦══════════╦═══════════╦═══════════╗
║  ID  ║ Tên Tour  ║ Điểm đến  ║ Loại Tour ║ Giá gốc  ║ Khuyến mãi║ Thao tác  ║
╠══════╬═══════════╬═══════════╬═══════════╬══════════╬═══════════╬═══════════╣
║  1   ║ Tour HN   ║ Hà Nội    ║ Trong nc  ║ Chưa có  ║ (Trống)   ║ Sửa | Xóa ║
╚══════╩═══════════╩═══════════╩═══════════╩══════════╩═══════════╩═══════════╝
         ❌ Không hợp lý              ❌ Không load data
```

### Sau khi sửa:
```
╔══════╦═══════════╦═══════════╦═══════════╦═════════════════╦═══════════╗
║  ID  ║ Tên Tour  ║ Điểm đến  ║ Loại Tour ║  Khuyến mãi     ║ Thao tác  ║
╠══════╬═══════════╬═══════════╬═══════════╬═════════════════╬═══════════╣
║  1   ║ Tour HN   ║ Hà Nội    ║ Trong nc  ║ 🎁 Giảm 20%     ║ Sửa | Xóa ║
║  2   ║ Tour SG   ║ Sài Gòn   ║ Trong nc  ║ Không có        ║ Sửa | Xóa ║
╚══════╩═══════════╩═══════════╩═══════════╩═════════════════╩═══════════╝
    ✅ Xóa cột không cần thiết      ✅ Hiển thị đầy đủ thông tin
```

---

## 🚀 Cách test

### 1. Rebuild backend
```bash
cd travel-backend
./mvnw clean install
./mvnw spring-boot:run
```

### 2. Test API trả về promotion
```bash
curl http://localhost:8080/api/tours
```

**Kỳ vọng:**
```json
[
  {
    "tourID": 1,
    "tourName": "Tour Hà Nội",
    "description": "...",
    "touristDestination": "Hà Nội",
    "tourType": {
      "tourTypeID": 1,
      "tourTypeName": "Trong nước"
    },
    "promotion": {                    // ✅ CÓ PROMOTION
      "promotionID": 1,
      "promotionName": "Giảm giá mùa hè",
      "percent": 20
    },
    "originalPrice": 5000000.0,
    "totalBookings": 10
  },
  {
    "tourID": 2,
    "tourName": "Tour Sài Gòn",
    "description": "...",
    "touristDestination": "Sài Gòn",
    "tourType": {...},
    "promotion": null,                // ✅ NULL NẾU KHÔNG CÓ
    "originalPrice": 3000000.0,
    "totalBookings": 5
  }
]
```

### 3. Test frontend
```bash
cd travel-frontend
ng serve
```

**Kiểm tra:**
1. ✅ Truy cập http://localhost:4200/admin/tours
2. ✅ Bảng chỉ còn 6 cột (không còn "Giá gốc")
3. ✅ Cột "Khuyến mãi" hiển thị:
   - `🎁 [Tên KM] (-[Percent]%)` nếu có promotion
   - `Không có` nếu promotion = null
4. ✅ Nút "Sửa" và "Xóa" hoạt động bình thường

---

## 📊 Tổng kết thay đổi

### Files đã sửa: 2 files

1. **Frontend:** `manage-tours.component.ts`
   - Xóa `originalPrice` khỏi interface Tour
   - Xóa cột "Giá gốc" khỏi bảng
   - Update colspan từ 7 → 6

2. **Backend:** `TourWithPriceDTO.java`
   - Thêm field `promotion`
   - Update 2 constructors để set promotion
   - Thêm getter/setter cho promotion

### Lines changed:
- Frontend: ~15 lines removed
- Backend: ~10 lines added

### Impact:
- ✅ Giao diện rõ ràng hơn (không có cột không cần thiết)
- ✅ Dữ liệu đầy đủ (promotion được load)
- ✅ Không ảnh hưởng chức năng khác
- ✅ API contract không thay đổi (chỉ thêm field)

---

## ⚠️ Notes

### 1. Về giá gốc
- Tours **KHÔNG** có thuộc tính giá
- Giá thuộc về **TourDeparture** (mỗi lịch khởi hành có giá riêng)
- Nếu cần hiển thị giá:
  - Tạo trang riêng: "Quản lý lịch khởi hành"
  - Hoặc thêm nested table trong tour detail

### 2. Về promotion
- Promotion được load từ `Tour.promotion` (ManyToOne relationship)
- Frontend hiển thị: Tên + Percent
- Có thể null (tour không có khuyến mãi)

### 3. API `/api/tours`
- Trả về `List<TourWithPriceDTO>`
- Bao gồm: Tour info + Min price + Total bookings + **Promotion**
- Dùng cho: Tour list, Tour search, Admin management

---

**Date:** 19/10/2025  
**Status:** ✅ COMPLETED  
**Tested:** ⏳ PENDING
