# Giao Diện Dành Riêng Cho Vai Trò: System Administrator (Quản Trị Hệ Thống)
> **Mã Giao Diện: UI-ROLE-05 — System Settings & Administration Console**  
> *Dành riêng cho: Quản trị viên hệ thống & Chuyên viên cấu hình vận hành nhà máy*  
> *Nguyên tắc cốt lõi: Không phân chia công đoạn (kỹ sư ngang hàng trong Part), Bỏ qua Cổng thủ kho HW (xuất kho đồng bộ từ EMS), Ngân sách SG No-Rollover nghiêm ngặt, Thời hạn thẩm định do LEC quy định.*

---

## 1. Tổng Quan Không Gian Làm Việc Của Quản Trị Viên (Workspace Anatomy)

Giao diện Admin Settings Console là **trung tâm đầu não cấu hình toàn bộ tham số vận hành của hệ thống**. Quản trị viên kiểm soát logic tính toán, cơ cấu phân cấp nhà xưởng, chính sách ngân sách và tầng tích hợp Gateway mà không cần can thiệp vào mã nguồn backend.

Cấu trúc giao diện gồm **6 Tab cấu hình chuyên sâu**:
1.  **Tab 1: 🧮 Cấu Hình Công Thức & Logic Mua Hàng (Reorder Logic Rules)**: Thiết lập quy tắc tính số lượng mua cho 5 loại nhu cầu cơ sở (`SETUP`, `IMPROVE`, `BREAKDOWN`, `PM`, `SAFETY_STOCK`), định mức tiêu hao theo Model Smart Watch (D111, D222, D333) và ngưỡng cảnh báo Over toàn team.
2.  **Tab 2: 🏭 Cấu Hình Master Data Nhà Xưởng & Dây Chuyền (Plant & Line Topology)**: Cấu hình Factory HW (Smart Watch - Org ID: 28753), Tòa nhà H1, H2, H3, Tầng 2F, 6F, Dây chuyền `#201` ~ `#210`, `#601`, `#604` với quy tắc tự động `Left(Line, 1) = Floor`. Tuyệt đối không chia công đoạn; danh mục máy và vị trí thân thiện gắn trực tiếp vào Line.
3.  **Tab 3: 👥 Cấu Hình Cây Tổ Chức, Vai Trò & Phân Quyền RBAC (Organization & Roles)**: Quản lý cây phân cấp 3 tầng chuẩn `Team (PO Module Tech Team 2) => Part (CP/SG Part 1) => Kỹ Sư Ngang Hàng (Peers)`. Chỉ định tài khoản chuyên trách LEC (Pham Duc Long - 658359) và tài khoản Cost Management (Reviewer & Assistant là 1 người).
4.  **Tab 4: 💰 Cấu Hình Ngân Sách SG & Thiết Lập Hạn Deadline Của LEC (SG Budget & Deadlines)**: Quản lý hạn mức ngân sách SG tháng, **chính sách Không Bảo Lưu (No-Rollover)** nghiêm ngặt giữa các tháng, và giao diện cho phép LEC thiết lập các mốc thời hạn (Deadline nộp giải trình tồn kho đầu tháng, Deadline chốt hồ sơ thẩm định đầu tháng).
5.  **Tab 5: 🔌 Cấu Hình Kết Nối EMS Gateway & Giao Thức Nexacro (Gateway & Rate Limiting)**: URL máy chủ EMS (`http://ems.lgdisplay.com:9000`), thông số bảo vệ máy chủ (`max_concurrent: 3`, `min_interval: 100ms`, `timeout: 30s`), danh sách dịch vụ trắng `allowed_services`, và nút kiểm thử kết nối trực tiếp `[⚡ KIỂM THỬ KẾT NỐI TỨC THÌ (PING)]`.
6.  **Tab 6: 🏷️ Cấu Hình Danh Mục Chuẩn Hóa & Mã Over (Master Dictionaries)**: Quản lý danh mục 6 mã nguyên nhân Over (`OVR-01` đến `OVR-06`), tiền tố sinh mã tạm thời (`TMP-HW-xxxx`), quy định dung lượng và định dạng tệp đính kèm.

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  TRUNG TÂM CÀI ĐẶT & CẤU HÌNH VẬN HÀNH — FACTORY HW (SMART WATCH)   [🔔 Hệ Thống Bình Thường] [👤 Admin (Quản Trị)] │
│ Ngữ cảnh: Factory HW (Display Module Plant 1 - Org ID: 28753)                   Môi trường: Production (Live with EMS Gateway)    │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CÁC TAB CẤU HÌNH HỆ THỐNG:                                                                                                       │
│ [🧮 1. LOGIC & CÔNG THỨC MUA] [🏭 2. NHÀ XƯỞNG & DÂY CHUYỀN] [👥 3. TỔ CHỨC & PHÂN QUYỀN]                                        │
│ [💰 4. NGÂN SÁCH SG & DEADLINES] [🔌 5. KẾT NỐI EMS GATEWAY]    [🏷️ 6. DANH MỤC & MÃ OVER]                                        │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📌 ĐANG CHỌN TAB 4: CẤU HÌNH CHÍNH SÁCH NGÂN SÁCH SG & THIẾT LẬP THỜI HẠN (DEADLINES DO LEC QUẢN LÝ)                             │
│                                                                                                                                  │
│ 4.1. CHÍNH SÁCH NGÂN SÁCH SG THÁNG (STRICT NO-ROLLOVER POLICY):                                                                  │
│ • Cơ Chế Bảo Lưu Số Dư Cuối Tháng: [🔴 KHÔNG BẢO LƯU (STRICT NO-ROLLOVER)] (Số dư chưa dùng hết trong tháng sẽ tự động hủy bỏ)  │
│ • Phương Thức Nhập Ngân Sách SG:   [ THỦ CÔNG THEO TỪNG THÁNG (MANUAL ENTRY BY LEC) ]                                            │
│ • Hạn Mức Ngân Sách Mua Sắm Tháng N: [ $65,000.00 USD ]      Hạn Mức Ngân Sách Xuất Kho Tháng N: [ $48,000.00 USD ]              │
│                                                                                                                                  │
│ 4.2. THIẾT LẬP THỜI HẠN THẨM ĐỊNH & GIẢI TRÌNH (LEC CONFIGURABLE DEADLINES):                                                     │
│ • Kỳ Thẩm Định Chi Phí Định Kỳ:    [ ĐẦU THÁNG (TỪ NGÀY 01 ĐẾN NGÀY 05 HÀNG THÁNG) ]                                             │
│ • Thời Hạn Kỹ Sư Nộp Giải Trình Tồn Kho:  [ Ngày 03 hàng tháng ] lúc [ 17:00 ] (Sau giờ này tự động khóa form nộp)              │
│ • Thời Hạn LEC Chốt Hồ Sơ Thẩm Định:      [ Ngày 05 hàng tháng ] lúc [ 12:00 ] (Đóng băng dữ liệu chuyển Cost Management)        │
│ • Cảnh Báo Tồn Kho Khác Team (agingInterlockFlag): Duy trì Task bắt buộc cho đến khi EMS đồng bộ lại trạng thái 'N'              │
│                                                                                                                                  │
│ ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── │
│                                                                                  [↩️ Khôi Phục Mặc Định]   [💾 LƯU CẤU HÌNH TAB 4] │
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
3. **Phân quyền và tạo tài khoản**: Quản lý cấp quyền RBAC cho 5 chức danh: Requestor, Leader, LEC, Cost Management (1 người), và Admin *(Hoàn toàn loại bỏ quyền Thủ kho)*.
