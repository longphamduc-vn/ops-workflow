# 03. MÀN HÌNH THÔNG TIN CÂY THIẾT BỊ, EBOM & TRA CỨU SLOT LINH KIỆN

> **Mã màn hình**: `UI-INFO-02`  
> **Tên màn hình**: Visual Machine Hierarchy, EBOM Drag-Drop & Replacement Mapping Information Screen  
> **Phạm vi hiển thị**: Kỹ sư hiện trường, Điều phối LEC, Lãnh đạo Team/Part.  
> **Mục tiêu**: Giảm thiểu độ phức tạp của hệ thống EBOM truyền thống thông qua giao diện trực quan hóa 3 khung kéo - thả; quản lý định mức tiêu chuẩn thay thế và giải tỏa hàng đợi khai báo muộn.

---

## 1. CẤU TRÚC BỐ CỤC KHÔNG GIAN THÔNG TIN (LAYOUT ANATOMY)

Màn hình được thiết kế theo bố cục lưới 3 cột trực quan kèm hàng đợi khai báo muộn ở phía dưới:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Khám Phá Cây EBOM Thiết Bị | Nhà Máy: Factory HW (Smart Watch) | Dây Chuyền: Line #201..#301   │
│ Trạng Thái: 🟢 Đã liên kết 48 cụm cơ cấu | ⚠️ 1 Hạng mục trong Hàng đợi khai báo muộn cần gán Slot      │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ BỐ CỤC 3 KHUNG LÀM VIỆC SONG SONG (3-PANE VISUAL WORKSPACE):                                           │
│ ┌──────────────────────────┬──────────────────────────────────────────┬──────────────────────────────┐ │
│ │ 1. CÂY PHÂN CẤP MÁY      │ 2. CỤM CƠ CẤU & SLOT LINH KIỆN ĐANG GÁN  │ 3. KHAY LINH KIỆN ĐĂNG KÝ    │ │
│ │ (KHUNG TRÁI - 3 CỘT)     │ (KHUNG GIỮA - 5 CỘT)                     │ (KHUNG PHẢI - 4 CỘT)         │ │
│ │ 🏭 Factory HW            │ Cụm: Feeder Unit (Cụm Cấp Phôi)          │ Khay phụ tùng dự phòng:      │ │
│ │  └── 🌐 Line #201 (2F)   │ Mã EM 14 Ký Tự: HWBMTL21EC0101           │ [🔎 Tìm QCode, Tên, Hãng]    │ │
│ │        └── ⚙️ DB-01      │ ──────────────────────────────────────── │ ┌──────────────────────────┐ │ │
│ │  └── 🌐 Line #202 (2F)   │ Các Slot linh kiện định mức:             │ │ [::] QDAB03583           │ │ │
│ │        └── ⚙️ TAB-02     │ 1. QDAB03583 - Cảm biến quang vuông      │ │ Cảm biến quang Panasonic │ │ │
│ │  └── 🌐 Line #301 (3F)   │    • Tiêu chuẩn: 2 EA • Tuổi thọ: 20,000h│ │ [Kéo thả] hoặc [Gán nhanh│ │ │
│ │        └── ⚙️ POL-01     │ 2. QCAD38190 - Xylanh 2 ty SMC           │ ├──────────────────────────┤ │ │
│ │                          │    • Tiêu chuẩn: 1 EA • Tuổi thọ: 15,000h│ │ [::] QDAD12236           │ │ │
│ │ [Nhấn để chọn máy]       │ ┌──────────────────────────────────────┐ │ │ Board nguồn Trumpf       │ │ │
│ │                          │ │   VÙNG THẢ LINH KIỆN VÀO CƠ CẤU      │ │ │ [Kéo thả] hoặc [Gán nhanh│ │ │
│ │                          │ │   (Kéo từ khay phải thả vào đây)     │ │ └──────────────────────────┘ │ │
│ │                          │ └──────────────────────────────────────┘ │                              │ │
│ └──────────────────────────┴──────────────────────────────────────────┴──────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. HÀNG ĐỢI KHAI BÁO MUỘN (LATE DECLARATION QUEUE - TỰ ĐỘNG GIẢI TỎA TÁC VỤ KỸ SƯ):                    │
│ Các hạng mục mua gấp khi máy dừng chuyền chưa kịp gán Slot EBOM (Thời hạn hoàn thành: 7 ngày):          │
│ ┌─────────────┬─────────────┬────────────────────────────────────┬─────────────────┬─────────────────┐ │
│ │Mã Đơn Mua   │Mã Linh Kiện │Tên Linh Kiện Mua Khẩn Cấp          │Thiết Bị Phát Sinh│Hành Động Khớp Nối│ │
│ ├─────────────┼─────────────┼────────────────────────────────────┼─────────────────┼─────────────────┤ │
│ │PR-2611-0085 │TMP-HW-0105  │Tấm đồ gá Chuck kẹp phôi tùy biến   │Die Bonder 01    │[Gán Vào Cụm Này]│ │
│ └─────────────┴─────────────┴────────────────────────────────────┴─────────────────┴─────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ĐẶC TẢ CHI TIẾT TỪNG PHÂN VÙNG THÔNG TIN

### 2.1. Khung 1: Cây Phân Cấp Thiết Bị Thân Thiện (Equipment Hierarchy Tree)
* **Cấu trúc dữ liệu phân cấp 4 tầng**:
  * **Tầng 1 - Nhà máy (Plant)**: `Factory HW` (Smart Watch Module Plant 1 - Org ID: 28753).
  * **Tầng 2 - Dây chuyền (Line)**: `Line #201` (Tầng 2F), `Line #202` (Tầng 2F), `Line #301` (Tầng 3F). Phản ánh quy tắc logic `Left(Line, 1) = Floor`.
  * **Tầng 3 - Tên máy thân thiện (Machine)**: `Die Bonder 01 (DB-01)`, `Tape Automated Bonder (TAB-02)`, `Polarizer Attach (POL-01)`.
  * **Tầng 4 - Cụm cơ cấu (Mechanism / Assembly)**: Hiển thị khi nhấn vào máy tương ứng.

### 2.2. Khung 2: Bàn Cơ Cấu & Các Slot Linh Kiện Định Mức
* **Thông tin cụm cơ cấu đang chọn**:
  * Tên cơ cấu thân thiện: Ví dụ `Feeder Unit (Cụm Cấp Liệu Phôi)`.
  * **Mã EM No 14 Ký Tự Chuẩn Hóa**: Ví dụ `HWBMTL21EC0101`.
* **Danh sách các Slot linh kiện đã được Matching**:
  * **Mã QCode & Tên phụ tùng**: Hiển thị rõ mã linh kiện đã đăng ký chính thức trên ERP.
  * **Số lượng định mức tiêu chuẩn (Standard Quantity)**: Số lượng linh kiện lắp thực tế trên cụm cơ cấu (e.g. `2 EA`).
  * **Chu kỳ tuổi thọ thay thế định mức (Replacement Lifespan)**: Thời gian vận hành khuyến cáo trước khi thay thế dự phòng (e.g. `20,000 giờ`, `15,000 giờ`, `8,000 giờ`).
  * **Ý nghĩa kiểm soát**: Khi kỹ sư tạo đơn mua có loại nhu cầu là `PM (Bảo Dưỡng)`, hệ thống tự động đối chiếu số lượng xin mua với `Standard Quantity` để kiểm tra có vượt định mức hay không.
* **Vùng thả linh kiện (Drop Target)**: Hỗ trợ bắt sự kiện HTML5 Drag-and-Drop khi kỹ sư kéo linh kiện từ Khung 3 thả vào.

### 2.3. Khung 3: Khay Linh Kiện Dự Phòng Đã Đăng Ký (Spare Parts Repository Tray)
* Danh mục các mã linh kiện sẵn sàng để gán vào cơ cấu:
  * Hiển thị mã QCode, tên linh kiện, hãng sản xuất (Maker), Model.
  * Hỗ trợ 2 phương thức thao tác linh hoạt:
    1. **Kéo - Thả (Drag and Drop)**: Kéo thẻ linh kiện từ Khung 3 thả vào Vùng thả của Khung 2.
    2. **Gán Nhanh 1-Click (Quick Bind Button)**: Nhấn nút `[Gán Nhanh]` trên thẻ linh kiện để tự động gán vào Cụm cơ cấu đang mở.

### 2.4. Phân Vùng 4: Hàng Đợi Khai Báo Muộn (Late Declaration Queue)
* **Giải quyết bài toán thực tế hiện trường**:
  * Khi máy trên chuyền gặp sự cố dừng máy khẩn cấp, kỹ sư không có thời gian ngồi định nghĩa cây EBOM mà cần mua gấp vật tư thay thế.
  * Khi đó, đơn mua được tạo với cờ `ebomPendingMapping = true`, và hệ thống tự động sinh ra một tác vụ `TASK-EBOM-...` với thời hạn 7 ngày.
* **Cơ chế đóng tác vụ tự động**:
  * Tại bảng hàng đợi này, kỹ sư chọn Cụm cơ cấu ở Khung 2 rồi nhấn nút **[Gán Vào Cụm Này]**.
  * Hệ thống lập tức thực hiện 3 hành động đồng thời:
    1. Thêm linh kiện vào danh sách Slot của cơ cấu.
    2. Gỡ bỏ cờ `ebomPendingMapping` trên đơn mua tương ứng.
    3. Tự động chuyển tác vụ `TASK-EBOM-...` trong Hộp thư của kỹ sư sang trạng thái `RESOLVED`.

---

## 3. TỪ ĐIỂN TRƯỜNG THÔNG TIN EBOM

| Tên Trường Hiển Thị | Mã Trường | Kiểu | Ý Nghĩa Kỹ Thuật |
| :--- | :--- | :---: | :--- |
| **Mã Cơ Cấu** | `mechanismId` | String | Khóa chính duy nhất của cụm: e.g. `MECH-DB01-FEED-01` |
| **Tên Thân Thiện Cơ Cấu** | `friendlyName` | String | Tên mô tả chức năng: `Feeder Unit (Cụm Cấp Liệu Phôi)` |
| **Mã Thiết Bị EM (14 Ký Tự)** | `emNo` | String (14) | Mã định danh thiết bị chuẩn: `HWBMTL21EC0101` |
| **Mã Máy Thuộc Về** | `machineId` | String | Mã máy: `DB-01`, `TAB-02`, `POL-01` |
| **Mã Linh Kiện Gán Slot** | `partCode` | String | Mã QCode linh kiện được gán: `QDAB03583` |
| **Tên Linh Kiện** | `partName` | String | Tên quy cách kỹ thuật của phụ tùng |
| **Số Lượng Tiêu Chuẩn** | `stdQty` | Number | Định mức lắp trên 1 cụm máy (e.g. `2 EA`) |
| **Tuổi Thọ Định Mức** | `replacementLifespan` | String | Chu kỳ giờ chạy định mức trước khi thay thế (e.g. `20,000h`) |
| **Cờ Chờ Khai Báo Muộn** | `ebomPendingMapping` | Boolean | `true` nếu mua khẩn cấp chưa gán Slot |
