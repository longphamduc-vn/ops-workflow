# Giao Diện Dành Riêng Cho Vai Trò: System Administrator (Quản Trị Hệ Thống)
> **Mã Giao Diện: UI-ROLE-05 — System Settings & Administration Console**  
> *Dành riêng cho: Quản trị viên hệ thống & Chuyên viên cấu hình vận hành nhà máy*

---

## 1. Tổng Quan Không Gian Làm Việc Của Quản Trị Viên (Workspace Anatomy)

Giao diện Admin Settings Console là **trung tâm đầu não cấu hình toàn bộ tham số vận hành của hệ thống**. Quản trị viên có toàn quyền kiểm soát logic tính toán, cơ cấu phân cấp nhà xưởng, chính sách ngân sách và tầng tích hợp Gateway mà không cần can thiệp vào mã nguồn backend.

Cấu trúc giao diện gồm **6 Tab cấu hình chuyên sâu**:
1.  **Tab 1: 🧮 Cấu Hình Công Thức & Logic Mua Hàng (Reorder Logic Rules)**: Thiết lập quy tắc tính số lượng mua cho 5 loại nhu cầu cơ sở (`SETUP`, `IMPROVE`, `BREAKDOWN`, `PM`, `SAFETY_STOCK`), định mức tuổi thọ MTBF theo Model Smart Watch (D111, D222, D333) và ngưỡng cảnh báo Over toàn team.
2.  **Tab 2: 🏭 Cấu Hình Master Data Nhà Xưởng & Dây Chuyền (Plant & Line Topology)**: Cấu hình Factory HW (Smart Watch), Tòa nhà H1, H2, H3, Tầng 2F, 6F, Dây chuyền `#201` ~ `#210`, `#601`, `#604` với quy tắc tự động `Left(Line, 1) = Floor`, cùng 6 công đoạn kỹ thuật: `POL | TAB | DIP | LT | DB | BD`.
3.  **Tab 3: 👥 Cấu Hình Cây Tổ Chức, Vai Trò & Phân Quyền RBAC (Organization & Roles)**: Quản lý cây phân cấp `Team (PO Module Tech Team 2) => Part (CP/SG Part 1) => Process => Users`, chỉ định tài khoản phụ trách chuyên trách LEC (Pham Duc Long - 658359).
4.  **Tab 4: 💰 Cấu Hình Ngân Sách SG 33-33-34 & Chu Kỳ Khóa Sổ (SG Budget & Billing Cycle)**: Tỷ trọng phân bổ ngân sách mua sắm quý $33\% - 33\% - 34\%$, cơ chế dồn số dư Rollover sang tháng sau, mốc khóa sổ kỳ tháng (ngày 25 hàng tháng lúc 17:00), và SLA đếm ngược chờ pháp nhân bạn xác nhận (48h).
5.  **Tab 5: 🔌 Cấu Hình Kết Nối EMS Gateway & Giao Thức Nexacro (Gateway & Rate Limiting)**: URL máy chủ EMS (`http://ems.lgdisplay.com:9000`), thông số bảo vệ máy chủ (`max_concurrent: 3`, `min_interval: 100ms`, `timeout: 30s`), danh sách dịch vụ trắng `allowed_services`, và nút kiểm thử kết nối trực tiếp `[⚡ KIỂM THỬ KẾT NỐI TỨC THÌ (PING)]`.
6.  **Tab 6: 🏷️ Cấu Hình Danh Mục Chuẩn Hóa & Mã Over (Master Dictionaries)**: Quản lý danh mục 6 mã nguyên nhân Over (`OVR-01` đến `OVR-06`), tiền tố quy tắc sinh mã tạm thời (`TMP-HW-YYYY-xxxx`), quy định dung lượng và định dạng tệp đính kèm.

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

## 3. Bản Vẽ Tab 5: Cấu Hình Kết Nối EMS Gateway & Giao Thức Nexacro

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📌 ĐANG CHỌN TAB 5: CẤU HÌNH KẾT NỐI EMS GATEWAY & BẢO VỆ MÁY CHỦ NEXACRO                                                         │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5.1. THÔNG SỐ KẾT NỐI MÁY CHỦ CORE EMS (LG DISPLAY PRODUCTION):                                                                  │
│ • Địa Chỉ EMS Gateway URL:    [ http://ems.lgdisplay.com:9000                                          ]                         │
│ • Mã Tổ Chức (Organization):  [ 28753 ] (Display Module Plant 1 = Factory HW = Smart Watch)                                      │
│ • Mã Nhân Viên Đại Diện LEC:  [ 658359 ] (Pham Duc Long - PO Module Technology Team 2)                                           │
│ • Trạng Thái Kết Nối Hiện Tại: 🟢 KẾT NỐI TỐT (Độ trễ: 42ms | Session Active: 658359)   [⚡ KIỂM THỬ KẾT NỐI TỨC THÌ (PING)]     │
│                                                                                                                                  │
│ 5.2. CẤU HÌNH BẢO VỆ CHỊU TẢI MÁY CHỦ (TRAFFIC SHAPING & RATE LIMITING):                                                         │
│ • Số Lượng Yêu Cầu Đồng Thời Tối Đa (Max Concurrent Requests): [ 3 ] kết nối song song                                           │
│ • Khoảng Cách Tối Thiểu Giữa 2 Lần Gọi (Min Interval Time):    [ 100 ] ms (Chống quá tải máy chủ Nexacro)                        │
│ • Thời Gian Chờ Tối Đa Mỗi Giao Dịch (Timeout):                [ 30 ] giây (Tự động ngắt kết nối nếu treo mạng)                  │
│ • Tự Động Đăng Nhập Lại Khi Hết Hạn Phiên (Auto Relogin):      [☑ Kích Hoạt] (Tự động bắt mã lỗi SESSION_TIMEOUT và relogin)     │
│                                                                                  [↩️ Khôi Phục Mặc Định]   [💾 LƯU CẤU HÌNH TAB 5] │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Quyền Hạn Độc Quyền Của System Administrator

1. **Thay đổi công thức logic mua hàng**: Quản trị viên là người duy nhất được chỉnh sửa cấu trúc biểu thức tính số lượng mua để áp dụng cho toàn bộ kỹ sư.
2. **Cấu hình tham số Gateway Nexacro**: Điều chỉnh Rate Limiting, timeout và danh sách endpoint được phép gọi để bảo vệ an toàn tuyệt đối cho hệ thống máy chủ core EMS.
3. **Phân quyền và tạo tài khoản**: Quản lý cấp quyền RBAC cho các chức danh Requestor, Leader, LEC và Warehouse.

