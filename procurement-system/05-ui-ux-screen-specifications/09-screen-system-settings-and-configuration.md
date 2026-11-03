# 09. Đặc Tả Giao Diện Chi Tiết: Màn Hình Cài Đặt & Cấu Hình Hệ Thống (System Settings Portal)
> *Trung tâm quản trị toàn diện: Cấu hình quy tắc logic mua hàng, cây nhà xưởng, phân quyền RBAC, ngân sách SG 33-33-34, kết nối EMS Gateway và danh mục chuẩn hóa*

---

## 1. Tổng Quan Kiến Trúc Giao Diện (Layout Anatomy)

Màn hình Cài Đặt Hệ Thống được thiết kế dành cho **Quản Trị Viên Hệ Thống (System Admin)** và **Đầu Mối Phụ Trách Kỹ Thuật LEC (Pham Duc Long - 658359)** nhằm thiết lập và điều chỉnh toàn bộ tham số vận hành của hệ thống mà không cần sửa code (Zero-Code System Configuration).

Giao diện được phân bổ thành 6 Phân Vùng Cấu Hình (Tab Chuyên Sâu):
1.  **Tab 1: Cấu hình Công Thức & Logic Mua Hàng (Reorder Rules & Calculation Logic)**: Quản lý quy tắc tính số lượng mua cho 5 loại nhu cầu (`Setup`, `Cải tiến`, `Thay thế hỏng`, `PM`, `Dự phòng`), công thức tiêu hao theo Model Smart Watch (D111, D222, D333) và ngưỡng cảnh báo Over ngoài kế hoạch.
2.  **Tab 2: Cấu hình Master Data Nhà Xưởng & Dây Chuyền (Plant & Line Topology)**: Quản lý Factory HW (Smart Watch), Tòa nhà H1, H2, H3, Tầng 2F, 6F, Dây chuyền `#201` ~ `#210`, `#601`, `#604` với quy tắc tự động `Left(Line, 1) = Floor`, cùng danh mục 6 công đoạn kỹ thuật (`POL | TAB | DIP | LT | DB | BD`).
3.  **Tab 3: Cấu hình Cây Tổ Chức, Vai Trò & Phân Quyền (Organization & RBAC)**: Quản lý phân cấp `Team (PO Module Tech Team 2) => Part (CP/SG Part 1) => Process => Users`, thiết lập tài khoản chuyên trách LEC (Pham Duc Long - User ID: 658359).
4.  **Tab 4: Cấu hình Ngân Sách SG & Chu Kỳ Chốt Kỳ Tháng (SG Budget & Billing Cycle)**: Tỷ lệ phân bổ ngân sách quý $33\% - 33\% - 34\%$, cơ chế dồn số dư ngân sách mua (Rollover Policy), mốc khóa kỳ mua sắm tháng (ngày 25 hàng tháng lúc 17:00), và thời hạn đếm ngược SLA chờ xác nhận liên pháp nhân (mặc định 48h).
5.  **Tab 5: Cấu hình Kết Nối EMS Gateway & Tham Số Nexacro (Gateway & Protocol Config)**: Địa chỉ máy chủ EMS (`http://ems.lgdisplay.com:9000`), thông số giới hạn tải (`max_concurrent: 3`, `min_interval: 100ms`, `timeout: 30s`), danh sách dịch vụ trắng (`allowed_services`), và cơ chế tự động duy trì session đăng nhập của tài khoản `658359`.
6.  **Tab 6: Cấu hình Danh Mục Chuẩn Hóa & Mã Over (Dictionaries & Codes)**: Quản lý 6 mã nguyên nhân Over (`OVR-01` đến `OVR-06`), tiền tố quy tắc sinh mã tạm thời (`TMP-HW-YYYY-xxxx`), quy định dung lượng và định dạng tệp đính kèm.

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  TRUNG TÂM CÀI ĐẶT & CẤU HÌNH VẬN HÀNH — FACTORY HW (SMART WATCH)   [🔔 Hệ Thống Bình Thường] [👤 Admin (Quản Trị)] │
│ Ngữ cảnh: Factory HW (Display Module Plant 1 - Org ID: 28753)                   Môi trường: Production (Live with EMS Gateway)    │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CÁC TAB CẤU HÌNH HỆ THỐNG:                                                                                                       │
│ [🧮 1. LOGIC & CÔNG THỨC MUA] [🏭 2. NHÀ XƯỞNG & DÂY CHUYỀN] [👥 3. TỔ CHỨC & PHÂN QUYỀN]                                        │
│ [💰 4. NGÂN SÁCH SG & KỲ THÁNG] [🔌 5. KẾT NỐI EMS GATEWAY]    [🏷️ 6. DANH MỤC & MÃ OVER]                                        │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📌 ĐANG CHỌN TAB 1: CẤU HÌNH CÔNG THỨC TÍNH TOÁN & LOGIC MUA HÀNG (CALCULATION LOGIC RULES)                                     │
│                                                                                                                                  │
│ 1.1. CẤU HÌNH QUY TẮC TÍNH SỐ LƯỢNG MUA CHO 5 LOẠI NHU CẦU CƠ SỞ:                                                                │
│ ┌──────────────────┬──────────────────────────────────────────────────────────┬───────────────────┬──────────────┬─────────────┐ │
│ │ Loại Nhu Cầu     │ Công Thức / Quy Tắc Tính Số Lượng Mua Chuẩn (Logic Rule) │ Tham Số Bắt Buộc  │ Phân Loại KH │ Thao Tác    │ │
│ ├──────────────────┼──────────────────────────────────────────────────────────┼───────────────────┼──────────────┼─────────────┤ │
│ │ 1. SETUP         │ Qty = (Norm_Per_Machine * New_Machines) + Buffer - Onhand│ Machine_Count, ECO│ 🔴 Over Ngoài│ [✏️ Chỉnh Sửa]│ │
│ │    (Máy/Model mới│                                                          │                   │ Kế Hoạch     │             │ │
│ ├──────────────────┼──────────────────────────────────────────────────────────┼───────────────────┼──────────────┼─────────────┤ │
│ │ 2. IMPROVE       │ Qty = Proposed_Trial_Qty (Giới hạn tối đa: 2 EA/Máy)     │ Kaizen_Project_Id │ 🔴 Over Ngoài│ [✏️ Chỉnh Sửa]│ │
│ │    (Cải tiến SX) │                                                          │                   │ Kế Hoạch     │             │ │
│ ├──────────────────┼──────────────────────────────────────────────────────────┼───────────────────┼──────────────┼─────────────┤ │
│ │ 3. BREAKDOWN     │ Qty = Actual_Damaged_Qty (Bù đúng số lượng linh kiện hỏng│ Work_Order_No,    │ 🔴 Over Ngoài│ [✏️ Chỉnh Sửa]│ │
│ │    (Thay thế hỏng│                                                          │ Incident_Photos   │ Kế Hoạch     │             │ │
│ ├──────────────────┼──────────────────────────────────────────────────────────┼───────────────────┼──────────────┼─────────────┤ │
│ │ 4. PM            │ Qty = (Monthly_Plan_Output / MTBF_Life) * Norm - PO_Rem  │ PM_Schedule_Date, │ 🟢 Trong     │ [✏️ Chỉnh Sửa]│ │
│ │    (Bảo dưỡng đk)│                                                          │ MTBF_Hours        │ Target       │             │ │
│ ├──────────────────┼──────────────────────────────────────────────────────────┼───────────────────┼──────────────┼─────────────┤ │
│ │ 5. SAFETY_STOCK  │ Qty = max(0, Target_Stock - (Onhand + PO_Remained))      │ Target_Stock_Qty, │ 🟢 Trong     │ [✏️ Chỉnh Sửa]│ │
│ │    (Dự phòng tồn)│ Làm tròn lên theo MOQ / Pack Size                        │ MOQ, Pack_Size    │ Target       │             │ │
│ └──────────────────┴──────────────────────────────────────────────────────────┴───────────────────┴──────────────┴─────────────┘ │
│                                                                                                                                  │
│ 1.2. THAM SỐ ĐỊNH MỨC THEO MODEL SMART WATCH & NGƯỠNG CẢNH BÁO OVER:                                                             │
│ • Áp dụng định mức tiêu hao phụ tùng cho các Model: [☑ D111 (Cơ bản)]  [☑ D222 (Cao cấp)]  [☑ D333 (Thể thao Siêu mỏng)]          │
│ • Hệ số an toàn tồn kho (Safety Stock Buffer Factor):   [ 1.15 ] (Tăng 15% dự phòng cho các linh kiện có Lead Time > 30 ngày)     │
│ • Ngưỡng cảnh báo chi phí Over toàn Team trong tháng:   [ $25,000.00 USD ] (Bắn thông báo cảnh báo vàng khi vượt 80% ngưỡng)      │
│ • Ép buộc nhập Work Order đối với loại đơn:             [☑ Ready-to-use (Tức sử dụng)]   [☑ Breakdown Replacement]                 │
│                                                                                                                                  │
│ ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── │
│                                                                                  [↩️ Khôi Phục Mặc Định]   [💾 LƯU CẤU HÌNH TAB 1] │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Bản Vẽ Giao Diện Tab 5: Cấu Hình Kết Nối EMS Gateway & Giao Thức Nexacro

Khi người dùng chuyển sang **`[🔌 5. KẾT NỐI EMS GATEWAY]`**:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📌 ĐANG CHỌN TAB 5: CẤU HÌNH KẾT NỐI EMS GATEWAY & BẢO VỆ MÁY CHỦ NEXACRO                                                         │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5.1. THÔNG SỐ KẾT NỐI MÁY CHỦ CORE EMS (LG DISPLAY PRODUCTION):                                                                  │
│ • Địa Chỉ EMS Gateway URL:    [ http://ems.lgdisplay.com:9000                                          ]                         │
│ • Mã Tổ Chức (Organization):  [ 28753 ] (Display Module Plant 1 = Factory HW = Smart Watch)                                      │
│ • Mã Nhân Viên Đại Diện LEC:  [ 658359 ] (Pham Duc Long - PO Module Technology Team 2)                                           │
│ • Ngôn Ngữ Trao Đổi Nexacro:  (•) EN (Tiếng Anh)    ( ) KO (Tiếng Hàn)    ( ) VN (Tiếng Việt)                                    │
│ • Trạng Thái Kết Nối Hiện Tại: 🟢 KẾT NỐI TỐT (Độ trễ: 42ms | Session Active: 658359)   [⚡ KIỂM THỬ KẾT NỐI TỨC THÌ (PING)]     │
│                                                                                                                                  │
│ 5.2. CẤU HÌNH BẢO VỆ CHỊU TẢI MÁY CHỦ (TRAFFIC SHAPING & RATE LIMITING):                                                         │
│ • Số Lượng Yêu Cầu Đồng Thời Tối Đa (Max Concurrent Requests): [ 3 ] kết nối song song                                           │
│ • Khoảng Cách Tối Thiểu Giữa 2 Lần Gọi (Min Interval Time):    [ 100 ] ms (Chống quá tải máy chủ Nexacro)                        │
│ • Thời Gian Chờ Tối Đa Mỗi Giao Dịch (Timeout):                [ 30 ] giây (Tự động ngắt kết nối nếu treo mạng)                  │
│ • Tự Động Đăng Nhập Lại Khi Hết Hạn Phiên (Auto Relogin):      [☑ Kích Hoạt] (Tự động bắt mã lỗi SESSION_TIMEOUT và relogin)     │
│                                                                                                                                  │
│ 5.3. DANH SÁCH DỊCH VỤ ĐƯỢC PHÉP TRUY VẤN (ALLOWED SERVICES WHITELIST):                                                          │
│ ┌────────────────────────────────────────────────────────┬────────────────────────────────────────┬─────────────┬──────────────┐ │
│ │ Đường Dẫn Dịch Vụ Nexacro (.lgdn)                      │ Mô Tả Chức Năng Tra Cứu                │ Dataset Xử Lý│ Bật / Tắt    │ │
│ ├────────────────────────────────────────────────────────┼────────────────────────────────────────┼─────────────┼──────────────┤ │
│ │ /emsspareparts/sp302/sp330Nav/TargetStockSearchList    │ Đọc tồn kho & lý do CheckDisuse        │ ds_StockInfo│ [🔘 BẬT]     │ │
│ │ /emsspareparts/sp40/sp401Nav/retPartsTransferReqList   │ Lệnh chuyển giao liên pháp nhân        │ ds_item     │ [🔘 BẬT]     │ │
│ │ /emsspareparts/sp40/sp405Nav/retOtherSitePoRevReqList  │ Kiểm tra tồn kho các site ngoài        │ ds_list     │ [🔘 BẬT]     │ │
│ │ /emscom/popupNav/retrieveItemPoStatusList              │ Đọc cờ Interlock nhị phân stopPoFlag   │ ds_Rtn      │ [🔘 BẬT]     │ │
│ │ /emsspareparts/sp102/sp130Nav/save130PrvData           │ Đẩy hồ sơ PRV phát hành PO chính thức  │ ds_param    │ [🔘 BẬT]     │ │
│ └────────────────────────────────────────────────────────┴────────────────────────────────────────┴─────────────┴──────────────┘ │
│                                                                                  [↩️ Khôi Phục Mặc Định]   [💾 LƯU CẤU HÌNH TAB 5] │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Cửa Sổ Modal Chỉnh Sửa Quy Tắc Công Thức (Logic Formula Editor Modal)

Khi người dùng bấm **`[✏️ Chỉnh Sửa]`** tại dòng số 4 (Nhu cầu bảo dưỡng PM):

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📐 THIẾT LẬP CÔNG THỨC LOGIC TÍNH SỐ LƯỢNG MUA CHO NHU CẦU: PM (BẢO DƯỠNG ĐỊNH KỲ)                          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ THÔNG TIN CẤU HÌNH CHUNG:                                                                                  │
│ • Tên Nhóm Nhu Cầu:   Bảo Dưỡng Định Kỳ (Preventive Maintenance - PM)                                      │
│ • Mã Định Danh:       REORDER_LOGIC_PM                                                                     │
│ • Nhãn Phân Loại Mặc Định: (•) 🟢 Trong Target (In-Plan)       ( ) 🔴 Over Ngoài Kế Hoạch (Unplanned)      │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CẤU TRÚC BIỂU THỨC LOGIC TOÁN HỌC (MATHEMATICAL EXPRESSION):                                               │
│ Công Thức Chuẩn Hóa:                                                                                       │
│ [ Qty = ceil((Plan_Output / MTBF_Norm) * Machine_Install_Qty) + Safety_Buffer - (Onhand + PO_Remained)     ] │
│                                                                                                            │
│ CÁC BIẾN SỐ HỆ THỐNG CÓ THỂ SỬ DỤNG (SYSTEM VARIABLES PICKER):                                             │
│ [➕ {Plan_Output} Sản lượng kế hoạch]    [➕ {MTBF_Norm} Tuổi thọ định mức]   [➕ {Install_Qty} Số lượng/máy]   │
│ [➕ {Target_Stock} Tồn an toàn EBOM]    [➕ {Onhand} Tồn kho khả dụng HW]    [➕ {PO_Remained} Đơn đang về]    │
│ [➕ {MOQ} Lô đặt hàng tối thiểu]       [➕ {Pack_Size} Quy cách đóng gói]   [➕ {Lead_Time_Days} Ngày giao]   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ RÀNG BUỘC KIỂM TRA TỰ ĐỘNG (VALIDATION RULES):                                                             │
│ • Bắt buộc người dùng nhập ngày bảo dưỡng dự kiến (PM Schedule Date): [☑ Có]                              │
│ • Nếu kết quả tính ra <= 0 thì tự động đặt số lượng mua về:           [ 0 ] EA (Không tạo đơn)             │
│ • Tự động làm tròn lên theo quy cách đóng gói (Pack Size):            [☑ Có]                              │
│ • Cho phép Kỹ sư điều chỉnh thủ công tăng/giảm tối đa:                 [ ± 10% ] so với công thức          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ HƯỚNG DẪN HIỂN THỊ GỢI Ý CHO KỸ SƯ TRÊN MÀN HÌNH TẠO ĐƠN (UI TOOLTIP TEXT):                                │
│ [ "Số lượng mua PM được tính tự động dựa trên kế hoạch sản lượng Smart Watch tháng tới chia cho định mức    │
│    tuổi thọ mài mòn của chi tiết, sau đó khấu trừ tồn kho on-hand và các đơn PO đang trên đường về."      ] │
│                                                                                                            │
│                                                                                [❌ Hủy Bỏ]   [💾 LƯU QUY TẮC]│
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Bảng Đặc Tả Chi Tiết Từng Phần Tử Giao Diện (Field Specification Matrix)

| Tên trường / Thành phần | Phân Vùng Tab | Loại UI Component | Quy tắc dữ liệu & Ràng buộc Validation | Ý nghĩa nghiệp vụ |
| :--- | :---: | :--- | :--- | :--- |
| **`logic_rule_code`** | Tab 1 | Text Input (Readonly) | Chuỗi in hoa: `^[A-Z_]{3,30}$`. | Khóa định danh cho 5 loại nhu cầu (`SETUP`, `IMPROVE`, `BREAKDOWN`, `PM`, `SAFETY_STOCK`). |
| **`formula_expression`** | Tab 1 | Code/Formula Input | Chứa các biến hợp lệ `{...}` và toán tử toán học. | Động cơ tính số lượng mua tự động của hệ thống. |
| **`allow_manual_override`**| Tab 1 | Checkbox Toggle | Boolean (true/false). | Cho phép kỹ sư ghi đè số lượng kèm giải trình lý do. |
| **`line_floor_rule`** | Tab 2 | Text Template | Biểu thức `Left(Line, 1) = Floor`. | Tự động suy luận số tầng (2F, 6F) từ số hiệu chuyền (#201..#604). |
| **`active_processes`** | Tab 2 | Multi-Select Chips | Bắt buộc 6 giá trị: `POL`, `TAB`, `DIP`, `LT`, `DB`, `BD`. | Danh mục 6 công đoạn kỹ thuật chuẩn của nhà máy Smart Watch. |
| **`lec_user_id`** | Tab 3 | Search Autocomplete | Mã nhân viên hợp lệ (6 số: `658359`). | Định danh tài khoản chuyên trách LEC trong Team (Pham Duc Long). |
| **`budget_split_ratio`** | Tab 4 | 3-Field Number Ratio | Tổng 3 tháng phải bằng đúng $100\%$ ($33\% + 33\% + 34\%$). | Tỷ lệ phân bổ ngân sách SG theo quý. |
| **`rollover_enabled`** | Tab 4 | Switch Button | Boolean. Mặc định `true`. | Cho phép dồn hạn mức mua chưa dùng từ Tháng 1 sang Tháng 2. |
| **`monthly_lock_day`** | Tab 4 | Number Selector | Giá trị từ 1 đến 28. Mặc định: `25`. | Ngày chốt sổ kỳ tháng để họp thẩm định Offline với Management. |
| **`inter_entity_sla_hours`**| Tab 4 | Number Input (Giờ) | Giá trị từ 24 đến 72. Mặc định: `48`. | Thời hạn tối đa chờ pháp nhân bạn xác nhận điều chuyển. |
| **`ems_gateway_url`** | Tab 5 | URL Input | Phải có tiền tố `http://` hoặc `https://` và cổng. | Địa chỉ kết nối tầng Gateway sang lõi Nexacro EMS. |
| **`max_concurrent_req`**| Tab 5 | Number Input | Giới hạn từ 1 đến 5 kết nối. Mặc định: `3`. | Bảo vệ máy chủ EMS cũ không bị quá tải kết nối. |
| **`min_interval_ms`** | Tab 5 | Number Input (ms) | Giới hạn từ 50 đến 500ms. Mặc định: `100`. | Khoảng cách an toàn giữa 2 lệnh gọi liên tiếp sang EMS. |
| **`temp_code_prefix`** | Tab 6 | Text Format | Mặc định: `TMP-HW-[YYYY]-`. | Tiền tố tự động cấp phát mã tạm cho các linh kiện chưa có QCode. |

---

## 6. Các Trạng Thái Giao Diện & Quy Tắc An Toàn (UI States & Safety Guards)

1.  **Cảnh báo Thay Đổi Tỷ Lệ Ngân Sách Giữa Kỳ (Active Cycle Protection)**:
    *   *Điều kiện*: Quản trị viên thay đổi tỷ lệ $33\% - 33\% - 34\%$ khi kỳ mua sắm của tháng hiện tại đã phát sinh các đơn PO đã cam kết.
    *   *Hiển thị*: Modal cảnh báo màu vàng: *"⚠️ Kỳ tháng 11/2026 đang mở và đã cam kết $42,500 USD. Việc điều chỉnh tỷ lệ ngân sách sẽ ảnh hưởng trực tiếp đến hạn mức Rollover của Tháng sau. Bạn có chắc chắn muốn áp dụng thay đổi ngay bây giờ hay để áp dụng cho Quý tiếp theo?"*.
2.  **Khóa Chặn Khi Cấu Hình Gateway Vượt Ngưỡng Chịu Tải (Stress Guard)**:
    *   *Điều kiện*: Người dùng đặt `max_concurrent_requests > 5` hoặc `min_interval_ms < 50ms`.
    *   *Hiển thị*: Khung viền đổi màu đỏ, nút Lưu bị vô hiệu hóa kèm cảnh báo: *"⛔ Vi phạm nguyên tắc bảo vệ hệ thống cốt lõi: Không được vượt quá 5 kết nối đồng thời hoặc tần suất gọi dưới 50ms để tránh nguy cơ làm sập máy chủ Nexacro EMS"*.
3.  **Kiểm Thử Kết Nối Thành Công (Ping Success Feedback)**:
    *   *Điều kiện*: Người dùng bấm `[⚡ KIỂM THỬ KẾT NỐI TỨC THÌ (PING)]`.
    *   *Hiển thị*: Spinner quay trong 0.5s, sau đó hiện thông báo xanh lá nhạt: *"✅ Kết nối thành công đến máy chủ Nexacro EMS (Org ID: 28753 - Factory HW). Thời gian phản hồi: 38ms. Phiên đăng nhập của tài khoản 658359 đang hoạt động bình thường"*.

