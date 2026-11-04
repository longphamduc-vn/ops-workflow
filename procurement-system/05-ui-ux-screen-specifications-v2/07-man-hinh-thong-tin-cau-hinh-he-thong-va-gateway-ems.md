# 07. MÀN HÌNH THÔNG TIN CẤU HÌNH HỆ THỐNG & GIÁM SÁT CỔNG EMS

> **Mã màn hình**: `UI-INFO-06`  
> **Tên màn hình**: System Topology, Rate Limiting & Integration Status Information Screen  
> **Vai trò người dùng**: Quản trị viên hệ thống (System Administrator) & Điều phối LEC (Cài đặt ngân sách/deadline).  
> **Mục tiêu**: Cung cấp giao diện quản trị thông số tập trung không cần code: Cấu trúc phân xưởng đa nhà máy, công thức định mức 5 loại nhu cầu, chính sách ngân sách không lũy kế (No-Rollover), và cơ chế giám sát giới hạn tần suất Token Bucket của cổng kết nối Nexacro EMS.

---

## 1. CẤU TRÚC BỐ CỤC KHÔNG GIAN THÔNG TIN (LAYOUT ANATOMY)

Màn hình được thiết kế theo cấu trúc Tab 6 phân hệ cấu hình quản trị:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Cài Đặt Tham Số Hệ Thống & Giám Sát Cổng EMS | Vai trò: Quản Trị Viên Hệ Thống (SysAdmin)       │
│ Trạng Thái Cổng EMS: 🟢 Online (Độ trễ: 38ms) | Thuật toán Token Bucket: 5 req/s (Đang hoạt động)      │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ĐIỀU HƯỚNG 6 PHÂN HỆ CẤU HÌNH THAM SỐ (6 CONFIG TABS):                                                 │
│ [ 1.Ngân Sách SG ] [ 2.Sơ Đồ Xưởng & Tầng ] [ 3.Ma Trận Vai Trò ]                                      │
│ [ 4.Định Mức 5 Nhu Cầu ] [ 5.Cổng EMS Nexacro ] [ 6.Từ Điển Mã Over ]                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 1: CẤU HÌNH TRẦN NGÂN SÁCH SG & KHÓA NGUYÊN TẮC NO-ROLLOVER]                             │
│ • Trần ngân sách SG mặc định hàng tháng: [$150,000] USD.                                               │
│ • Quy tắc toán học khóa cứng: Số dư chuyển sang tháng sau = $0 USD (Tuyệt đối không cộng dồn số dư).   │
│ • Thời điểm đóng băng dữ liệu (Freeze window): 23:59 ngày cuối tháng.                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 2: CẤU TRÚC NHÀ MÁY & QUY TẮC BIÊN DỊCH TẦNG (FLOOR TOPOLOGY)]                           │
│ 1. Danh sách nhà máy trực thuộc: Factory HW (Smart Watch) | Factory TV | Factory Auto Display.         │
│ 2. Quy tắc biên dịch tầng tự động: Left(Line, 1) = Tầng (Floor).                                       │
│ 3. Khung thử nghiệm quy tắc biên dịch:                                                                 │
│    [ Nhập số chuyền: 201 ] ➔ [ Kết quả biên dịch: Tầng 2F ]                                            │
│    [ Nhập số chuyền: 301 ] ➔ [ Kết quả biên dịch: Tầng 3F ]                                            │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 3: MA TRẬN PHÂN QUYỀN 5 VAI TRÒ CHUẨN HÓA (LOẠI BỎ THỦ KHO)]                             │
│ 1. Field Engineer (Kỹ sư hiện trường): Đồng nghiệp ngang hàng, làm việc theo tên máy thân thiện.      │
│ 2. Leader Part & Team: Giám sát kỹ thuật, đối soát WO (Tuyệt đối không có nút duyệt PRV trên app).    │
│ 3. Team LEC (Master Workbench): Gom mẻ, giải tỏa Interlock, đánh dấu Target/Over, mốc Inbound.         │
│ 4. Cost Management (Quản lý chi phí): 1 chuyên viên (Reviewer & Assistant), thẩm định đầu tháng.       │
│ 5. System Administrator: Toàn quyền cấu hình tham số kỹ thuật và giám sát Gateway.                     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 4: CÔNG THỨC TÍNH TOÁN 5 LOẠI NHU CẦU MUA SẮM]                                           │
│ • 1. BREAKDOWN (Sự cố): 1 EA (Thay thế trực tiếp) — Bắt buộc mã Work Order sự cố.                      │
│ • 2. PM (Bảo dưỡng): Nhu cầu = StdQty x Số máy đến hạn PM (Căn cứ chu kỳ tuổi thọ EBOM).              │
│ • 3. IMPROVE (Cải tiến): Theo đề xuất dự án cải tiến.                                                 │
│ • 4. SETUP (Model mới): Bộ đồ gá mới (Jig/Nozzle) theo Model NPI.                                      │
│ • 5. SAFETY STOCK (Dự phòng): Safety = Max(DailyUsage x LeadTime x 1.25 - OnHand, 0).                 │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 5: GIÁM SÁT CỔNG EMS NEXACRO GATEWAY & KIỂM SOÁT TẦN SUẤT]                              │
│ • Thuật toán Token Bucket: Tốc độ tối đa = 5 Requests / Giây | Dung lượng Burst = 50 Requests.         │
│ • Nút [Ping Thử Nghiệm Kết Nối]: Kiểm tra độ trễ phản hồi từ máy chủ Nexacro Core (e.g. 38ms - OK).   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 6: TỪ ĐIỂN MASTER 6 MÃ NGUYÊN NHÂN OVER (OVR-01..06)]                                    │
│ Bảng tra cứu định nghĩa, giải thích vận hành và hồ sơ đối chiếu bắt buộc cho từng mã Over.              │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ĐẶC TẢ CHI TIẾT 6 PHÂN HỆ CẤU HÌNH

### 2.1. Tab 1: Cấu Hình Ngân Sách SG & Nguyên Tắc No-Rollover
* **Thực thi Nguyên tắc vàng #10**:
  * Giao diện cho phép cấu hình hạn mức trần phân bổ hàng tháng của phân xưởng.
  * Tham số `carryoverSurplus` được khóa cứng ở giá trị `$0` và không thể chỉnh sửa, đảm bảo hệ thống tự động reset số dư về 0 khi bước sang chu kỳ tháng mới.
  * Cung cấp cơ chế đóng băng dữ liệu (Freeze Window) vào 23:59 ngày cuối tháng để ngăn chặn các đơn mua phát sinh muộn làm sai lệch số liệu kế toán.

### 2.2. Tab 2: Cấu Trúc Nhà Máy & Quy Tắc Tầng (Plant & Floor Topology)
* **Khả năng mở rộng đa nhà máy (Multi-Plant Scalability)**:
  * Hệ thống hỗ trợ mở rộng sang các phân xưởng khác trong tổ hợp LG Display Hải Phòng:
    * `Factory HW`: Phân xưởng Module màn hình Smart Watch 1 (Org ID: `28753`).
    * `Factory TV`: Phân xưởng Module màn hình OLED kích thước lớn (Org ID: `29011`).
    * `Factory Auto Display`: Phân xưởng màn hình hiển thị ô tô (Org ID: `31054`).
* **Quy tắc biên dịch số chuyền sang tầng lầu**:
  * Công thức chuẩn hóa: `Left(Line, 1) = Floor`.
  * Bộ kiểm thử tương tác (Interactive Floor Tester): Cho phép quản trị viên nhập số chuyền (ví dụ `201`, `202`, `301`) và hệ thống hiển thị kết quả tầng tương ứng (`2F`, `3F`), loại bỏ sự cần thiết phải khai báo thủ công từng tầng cho mỗi chuyền mới.

### 2.3. Tab 3: Ma Trận Phân Quyền 5 Vai Trò Người Dùng Chuẩn Hóa
* **Hiện thực hóa tinh gọn bộ máy vận hành**:
  * **Loại bỏ vai trò Thủ kho (Warehouse Keeper)**: Thủ kho không sử dụng ứng dụng này; dữ liệu xuất nhập kho được tự động đồng bộ từ EMS `ds_Inv`.
  * **Loại bỏ vai trò Trưởng công đoạn phê duyệt**: Xóa bỏ các cổng phê duyệt rườm rà (POL, TAB, DIP); kỹ sư là đồng nghiệp ngang hàng trực tiếp tạo đơn.
  * **Hợp nhất Reviewer & Assistant**: Bộ phận Quản lý Chi phí chỉ cần 1 cá nhân duy nhất để thực hiện thẩm định và kiểm thảo.

### 2.4. Tab 4: Công Thức Định Mức 5 Loại Nhu Cầu Mua Sắm
* Cung cấp bảng công thức tiêu chuẩn hóa logic tạo đơn mua của kỹ sư:
  1. `BREAKDOWN`: Số lượng xin mua mặc định là 1 EA; bắt buộc phải gắn kèm mã phiếu sự cố `workOrderNo`.
  2. `PM`: Tính toán tự động theo công thức:  
     $$\text{Nhu cầu} = \text{Standard Quantity} \times \text{Số máy đến hạn PM}$$
  3. `IMPROVE`: Mua sắm theo định mức được duyệt của đề án cải tiến kỹ thuật (CIP).
  4. `SETUP`: Cung cấp bộ đồ gá mới (Jig/Nozzle) cho các dòng sản phẩm NPI.
  5. `SAFETY_STOCK`: Dự phòng an toàn theo công thức:  
     $$\text{Safety Stock} = \max(\text{DailyUsage} \times \text{LeadTime} \times 1.25 - \text{OnHand}, 0)$$

### 2.5. Tab 5: Giám Sát Cổng Nexacro EMS Gateway & Kiểm Soát Tần Suất
* **Bảo vệ hạ tầng máy chủ EMS Nexacro của tập đoàn**:
  * Máy chủ EMS có độ nhạy tải cao khi xử lý đồng thời nhiều phòng ban.
  * Cổng kết nối tích hợp thuật toán **Token Bucket Rate Limiting**:
    * **Tần suất giới hạn**: Tối đa `5 requests/giây`.
    * **Dung lượng hàng đợi burst**: Tối đa `50 requests`.
    * **Cơ chế Re-try Exponential Backoff**: Khi gặp phản hồi bận `EMS-503`, hệ thống tự động giãn cách gọi lại sau 1s, 2s, 4s, 8s.
  * Nút **[Ping Thử Nghiệm]**: Gửi gói tin giả lập kiểm tra thời gian đáp ứng (Response Latency) của cổng EMS Gateway (độ trễ thông thường: 35-50ms).

### 2.6. Tab 6: Từ Điển Master 6 Mã Nguyên Nhân Over
* Bảng tra cứu toàn bộ 6 mã Over phục vụ chuẩn mực đối soát chung giữa Kỹ sư, LEC và Quản lý Chi phí:
  * `OVR-01`: Đột xuất hỏng hóc dừng chuyền (Line Stop) $\rightarrow$ Chứng từ bắt buộc: Mã Work Order (WO).
  * `OVR-02`: Tăng sản lượng đột biến (Production Surge) $\rightarrow$ Chứng từ: Kế hoạch sản xuất cập nhật.
  * `OVR-03`: Chậm trễ chuyển giao liên pháp nhân $\rightarrow$ Chứng từ: Mã phiếu Transfer trễ hạn.
  * `OVR-04`: Setup model mới (e.g. D111 $\rightarrow$ D222) $\rightarrow$ Chứng từ: Phiên bản Model & Kế hoạch NPI.
  * `OVR-05`: Biến động giá / Tỷ giá ngoại tệ NCC $\rightarrow$ Chứng từ: Báo giá so sánh của Mua hàng.
  * `OVR-06`: Hư hỏng trong căn chỉnh/lắp đặt $\rightarrow$ Chứng từ: Biên bản bất thường kỹ thuật.

---

## 3. TỪ ĐIỂN TRƯỜNG THÔNG TIN QUẢN TRỊ HỆ THỐNG

| Tên Trường Hiển Thị | Mã Trường | Kiểu | Ý Nghĩa Cấu Hình |
| :--- | :--- | :---: | :--- |
| **Trần Ngân Sách Mặc Định**| `defaultBudgetCap` | Currency | Hạn mức chi phí SG hàng tháng của phân xưởng ($150,000 USD) |
| **Khóa Lũy Kế Ngân Sách** | `strictNoRollover` | Boolean (Locked)| Luôn bằng `true` (Không cho phép cộng dồn số dư) |
| **Mã Nhà Máy Vận Hành** | `plantCode` | String | Mã nhà máy: `HW` (Smart Watch), `TV` (OLED TV), `AD` (Auto) |
| **Quy Tắc Biên Dịch Tầng** | `floorRuleExpression`| String | Biểu thức logic: `Left(Line, 1) = Floor` |
| **Tốc Độ Gọi API Tối Đa** | `rateLimitMaxRps` | Number | Giới hạn Token Bucket: `5 requests/second` |
| **Dung Lượng Hàng Đợi Burst**| `rateLimitBurst` | Number | Bộ đệm cuộc gọi tối đa: `50 requests` |
| **Độ Trễ Phản Hồi Gateway**| `apiLatencyMs` | Number | Thời gian phản hồi kiểm tra ping (e.g. `38ms`) |
| **Danh Mục 6 Mã Over** | `overReasonDictionary`| Array[Object]| Tập hợp 6 mã chuẩn hóa `OVR-01` đến `OVR-06` |
