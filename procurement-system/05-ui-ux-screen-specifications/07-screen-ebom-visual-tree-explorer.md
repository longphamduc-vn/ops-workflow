# 07. Đặc Tả Giao Diện Chi Tiết: Màn Hình Kéo - Thả EBOM Trực Quan (Drag-and-Drop EBOM Slot Mapper)
> *Mã Màn Hình: UI-EBOM-01 | Phân Tách Tên Thân Thiện vs EM No, Kéo Thả Phụ Tùng Vào Cơ Cấu Máy & Cơ Chế Khai Báo Sau (Late Declaration)*

---

## 1. Triết Lý Thiết Kế & Giải Pháp Giảm Độ Phức Tạp

Trong hệ thống bảo trì và mua sắm truyền thống, việc khai báo cây thiết bị (EBOM) thường bị coi là công việc hành chính nặng nề, khiến kỹ sư ngại cập nhật hoặc nhập sai lệch.
Màn hình **UI-EBOM-01** được thiết kế lại toàn diện nhằm đạt 4 mục tiêu:
1.  **Làm việc bằng Tên Thân Thiện**: Kỹ sư chỉ thao tác với Tên Dây Chuyền, Tên Máy, Tên Cụm Cơ Cấu quen thuộc (ví dụ: *Line #201, Máy Die Bonder DB-01, Cụm Đầu Gắp Bonding Head*). Mã kỹ thuật 14 ký tự `EM No` (`HWBMTL21EC0101`) do hệ thống tự sinh ngầm dựa trên cấu hình Master Data của LEC.
2.  **Trải nghiệm Kéo - Thả Trực Quan (Drag-and-Drop)**: Nắm kéo linh kiện từ danh mục thả trực tiếp vào ô Cơ cấu máy.
3.  **Cơ Chế Khai Báo Sau (Late Declaration)**: Cho phép tạo requisition mua ngay cả khi cơ cấu máy chưa kịp khai báo trong EBOM, không gây tắc nghẽn sản xuất.
4.  **Khả Năng Nhân Rộng Đa Nhà Máy (Multi-Plant Selector)**: Hỗ trợ chuyển đổi tức thì giữa Nhà máy Smart Watch (HW), TV, Auto Display...

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  BÀN THIẾT KẾ & ÁNH XẠ EBOM TRỰC QUAN (DRAG-AND-DROP EBOM SLOT MAPPER)            [Nhà máy: 🏭 HW Smart Watch 1 ▼]    │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔍 BỘ TÌM KIẾM NHANH:  [ Nhập Tên Máy / Tên Cơ Cấu / QCode / EM No...                      ] [⚡ TÌM & ĐỊNH VỊ]                   │
├───────────────────────────────────┬──────────────────────────────────────────────────┬───────────────────────────────────────────┤
│ KHUNG 1: CÂY CƠ CẤU MÁY           │ KHUNG 2: BÀN LÀM VIỆC CƠ CẤU (SLOT SCHEMATIC)    │ KHUNG 3: KHAY PHỤ TÙNG CHỜ GẮN            │
│ (THÂN THIỆN THEO PHÂN CẤP)        │ Máy Đang Chọn: 🤖 Die Bonder 01 (DB-01)          │ (SPARE PARTS TRAY - KÉO THẢ)              │
├───────────────────────────────────┼──────────────────────────────────────────────────┼───────────────────────────────────────────┤
│ ▼ 🏭 Factory HW (Smart Watch 1)   │ Vị Trí: Line #201 (2F) | Công đoạn: DB           │ [🔍 Lọc theo Maker / QCode / Tên...]      │
│   ▼ 🌐 Line #201 (Smart Watch L1) │ Mã Quản Lý Master: HWBMTL21EC0000 (LEC Đăng Ký)  │                                           │
│     ▼ 🤖 Máy DB-01 (Die Bonder 01)│ ──────────────────────────────────────────────── │ ┌───────────────────────────────────────┐ │
│       ├── 📂 Unit 01: Cụm Cấp Liệu│ 🧩 CƠ CẤU 01: RAY TRƯỢT DẪN HƯỚNG CẤP LIỆU       │ │ ▧ QDAB03583 - Cảm Biến Quang Vuông    │ │
│       │   ├── 📌 Mech 01: Ray trượ│    Mã Slot: MECH-DB01-FEED-01                    │ │   Maker: Panasonic | Model: CN-73-C2  │ │
│       │   └── 📌 Mech 02: Kẹp phôi│ ┌──────────────────────────────────────────────┐ │ │   [✋ NẮM KÉO VÀO SLOT TRÊN CANVAS ➔] │ │
│       ├── 📂 Unit 02: Bonding Head│ │ • Slot Phụ Tùng 1:                           │ │ └───────────────────────────────────────┘ │
│       │   ├── 📌 Mech 01: Tay gắp │ │   [ QDAB03583 - Cảm Biến Quang Vuông (1 EA) ]│ │ ┌───────────────────────────────────────┐ │
│       │   └── 📌 Mech 02: Đầu dán │ │   Tuổi thọ: 20,000h | Phân loại: Tiêu hao    │ │ │ ▧ QCAD38190 - Xylanh Đôi SMC 16-100B  │ │
│       └── ⚠️ 1 Cơ Cấu Khai Báo Sau│ ├──────────────────────────────────────────────┤ │ │   Maker: SMC | Model: MXQ16-100B      │ │
│     ► 🤖 Máy DB-02                │ │ • Slot Phụ Tùng 2:                           │ │ │   [✋ NẮM KÉO VÀO SLOT TRÊN CANVAS ➔] │ │
│     ► 🤖 Máy EC-01                │ │   [ ➕ KÉO THẢ PHỤ TÙNG TỪ KHAY PHẢI VÀO ĐÂY ]│ │ └───────────────────────────────────────┘ │
│   ► 🌐 Line #202                  │ └──────────────────────────────────────────────┘ │ ┌───────────────────────────────────────┐ │
│   ► 🌐 Line #203                  │                                                  │ │ ▧ QDAD12236 - Board Nguồn CPX V4 Trump│ │
│ ───────────────────────────────── │ 🧩 CƠ CẤU 02: CỤM ĐẦU GẮN CHIP (BONDING NOZZLE) │ │   Maker: Trumpf | Model: 2912146       │ │
│ ⚠️ HÀNG ĐỢI KHAI BÁO SAU (LATE):  │    Mã Slot: MECH-DB01-HEAD-02                    │ │   [✋ NẮM KÉO VÀO SLOT TRÊN CANVAS ➔] │ │
│ • PR-2611-0089: Cụm Gạt Xỉ (DB-01)│ ┌──────────────────────────────────────────────┐ │ └───────────────────────────────────────┘ │
│   [⚡ Kéo vào cây để hoàn tất]     │ │ • Slot Phụ Tùng 1:                           │ │ ┌───────────────────────────────────────┐ │
│                                   │ │   [ QCAD38190 - Xylanh Đôi SMC (2 EA) ]      │ │ │ ▧ TMP-HW-0105 - Cữ Kẹp Tự Chế         │ │
│                                   │ │ • Slot Phụ Tùng 2:                           │ │ │   (Gia công ngoài, đã duyệt bản vẽ)   │ │
│                                   │ │   [ ➕ KÉO THẢ PHỤ TÙNG TỪ KHAY PHẢI VÀO ĐÂY ]│ │ │   [✋ NẮM KÉO VÀO SLOT TRÊN CANVAS ➔] │ │
│                                   │ └──────────────────────────────────────────────┘ │ └───────────────────────────────────────┘ │
├───────────────────────────────────┴──────────────────────────────────────────────────┴───────────────────────────────────────────┤
│  THAO TÁC CƠ CẤU:  [➕ THÊM CƠ CẤU MỚI CHO MÁY NÀY]   [📐 XEM BẢN VẼ CAD CỤM MÁY]   [💾 LƯU CẤU HÌNH EBOM]   [📤 XUẤT CÂY EXCEL] │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Các Luồng Nghiệp Vụ Cốt Lõi Trên Màn Hình

### 3.1. Kéo - Thả Khớp Nối Phụ Tùng Vào Chi Tiết Cơ Cấu (Drag-and-Drop Slot Binding)
- Khi Kỹ sư hoặc LEC mở máy `DB-01`, Khung giữa hiển thị danh sách các Cơ Cấu (Mechanism Units) của cỗ máy đó.
- Người dùng nắm kéo một thẻ linh kiện (ví dụ `QCAD38190`) từ Khay phụ tùng bên phải và thả vào ô `[➕ KÉO THẢ PHỤ TÙNG VÀO ĐÂY]`.
- Hệ thống lập tức hiển thị popup cấu hình số lượng định mức:
  - *Số lượng lắp trên cơ cấu này*: `2 EA`.
  - *Chu kỳ thay thế dự kiến*: `1,000,000 chu kỳ` (hoặc `180 ngày`).
  - *Ghi chú kỹ thuật*: *"Lắp tại vị trí pittong trượt hành trình Z"*.
- Bấm `Xác Nhận`, hệ thống tự động ghi nhận vào CSDL EBOM mà không cần viết mã phức tạp.

### 3.2. Xử Lý Cơ Cấu "Khai Báo Sau" (Late Declaration Queue Processing)
- Khi một Kỹ sư Quy trình tạo requisition mua phụ tùng cho một cơ cấu phát sinh ngoài hiện trường chưa kịp tạo trong EBOM:
  - Requisition được duyệt bình thường với cờ `EBOM_PENDING_MAPPING = true`.
  - Hạng mục tự động rơi vào mục **`⚠️ HÀNG ĐỢI KHAI BÁO SAU`** ở góc dưới Khung 1.
- Để hoàn tất hồ sơ:
  1. Kỹ sư click vào hạng mục đang chờ trong hàng đợi.
  2. Bấm nút `[➕ Thêm Cơ Cấu Mới Cho Máy Này]`, gõ Tên cơ cấu thân thiện (ví dụ: *"Cụm Gạt Xỉ Ca Đêm"*).
  3. Kéo linh kiện tương ứng thả vào cơ cấu vừa tạo.
  4. Hệ thống tự động xóa cờ `EBOM_PENDING_MAPPING` và cập nhật lịch sử cho phiếu mua ban đầu.

### 3.3. Tương Tác Giữa Tên Thân Thiện & EM No
- Requestor không bao giờ phải gõ `HWBMTL21EC0101`.
- Khi LEC bấm `[💾 Lưu Cấu Hình EBOM]`:
  - Hệ thống tự động phân tích: Factory = `HW`, Floor = `2`, Line = `1`, Machine = `EC`, Unit = `01`, Assembly = `01`.
  - Ghép chuỗi chuẩn hóa: `HWBMTL21EC0101` và lưu vào trường `em_no`.
  - Hiển thị song song: `"Tên Thân Thiện: Cụm Cấp Liệu Feeder (HWBMTL21EC0101)"`.

---

## 4. Đặc Tả Dữ Liệu Tương Tác (Frontend State Schema)

```typescript
interface EbomMechanismSlot {
  mechanismId: string;         // 'MECH-DB01-FEED-01'
  friendlyName: string;        // 'Ray trượt dẫn hướng cấp liệu'
  unitCode: string;            // '01'
  assemblyCode: string;        // '01'
  emNoGenerated: string;       // 'HWBMTL21EC0101'
  boundParts: Array<{
    partCode: string;          // 'QDAB03583' hoặc 'TMP-HW-0101'
    partName: string;
    maker: string;
    model: string;
    standardQty: number;       // 1
    unit: string;              // 'EA'
    replacementLifespan: string;
  }>;
  status: 'ACTIVE' | 'PENDING_LATE_DECLARATION';
}
```
